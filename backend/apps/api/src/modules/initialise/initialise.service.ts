import { ConflictException, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { User } from "@api/modules/users/entities";
import { EntityManager, Repository } from "typeorm";
import { Organization } from "../organization";
import { InitialiseType } from "@api/models/requests/init.dto";
import { Permission, Role } from "@api/modules/roles";
import { OrganizationMember } from "@api/modules/organization/entities";
import { AuthService } from "@api/modules/auth";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { Address } from "@api/modules/addresses/entities";

@Injectable()
export class InitialiseService {
	constructor(
		@InjectRepository(User)
		private readonly UsersRepository: Repository<User>,
		@InjectRepository(Organization)
		private readonly OrganisationRepository: Repository<Organization>,
		@InjectRepository(OrganizationMember)
		private readonly organizationMembersRepository: Repository<OrganizationMember>,
		@InjectRepository(Address)
		private readonly AddressRepository: Repository<Address>,
		@InjectRepository(Role)
		private readonly RoleRepository: Repository<Role>,
		@InjectEntityManager()
		private readonly entityManager: EntityManager,
		private readonly mailerService: MailerService,
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * Save user entity
	 * @param init
	 * @returns
	 */
	async initialiseSystem(init: InitialiseType) {
		const { user, role, organization } = await this.entityManager.transaction(async (em) => {
			const userCount = await this.UsersRepository.count();
			const organizationCount = await this.OrganisationRepository.count({ where: { isDeleted: false } });

			if (userCount > 0 && organizationCount > 0) {
				throw new ConflictException("System is already initialised");
			}

			const { user, organization } = init;

			// Create Admin Role with All Permissions
			let adminRole = this.RoleRepository.create({
				name: "Admin",
				permissions: Object.values(Permission), // Assign all permissions
			});
			adminRole = await this.RoleRepository.save(adminRole);

			// Create Personal Address for the User
			let personalAddress = user?.personalAddress
				? this.AddressRepository.create({
						street: user.personalAddress.street,
						city: user.personalAddress.city,
						houseNumber: user.personalAddress.houseNumber,
						zip: user.personalAddress.zip,
						country: user.personalAddress.country,
					})
				: null;

			if (personalAddress) {
				personalAddress = await this.AddressRepository.save(personalAddress);
			}

			// Create Admin User with Hashed Password
			let adminUser = this.UsersRepository.create({
				email: user.email,
				username: user.username,
				firstName: user.firstName,
				lastName: user.lastName,
				password: user.password,
				birthDate: user.birthDate,
				nationality: user.nationality,
				role: adminRole, // add created an admin role
				personalAddress: personalAddress, // add personal address
			});
			adminUser = await this.UsersRepository.save(adminUser);

			// Create Organisation with Address
			let organizationAddress = this.AddressRepository.create({
				street: organization.address.street,
				city: organization.address.city,
				houseNumber: organization.address.houseNumber,
				zip: organization.address.zip,
				country: organization.address.country,
			});
			organizationAddress = await this.AddressRepository.save(organizationAddress);

			let newOrganization = this.OrganisationRepository.create({
				name: organization.name,
				cin: organization?.cin ?? null,
				vatin: organization?.vatin ?? null,
				address: organizationAddress, // add create organisation address
			});
			newOrganization = await this.OrganisationRepository.save(newOrganization);

			// Add Admin User as a Member of the Organisation
			const organizationMember = this.organizationMembersRepository.create({
				user: adminUser,
				organization: newOrganization,
			});
			await this.organizationMembersRepository.save(organizationMember);

			// Assign Admin User as Manager of the Organisation
			newOrganization.manager = adminUser;
			await this.OrganisationRepository.save(newOrganization);

			return {
				user: adminUser,
				organization: newOrganization,
				role: adminRole,
			};
		});

		const verificationToken = await this.authService.createEmailVerificationToken(user);
		const verifyUrl = `${this.configService.getOrThrow("WEB_DOMAIN")}/verify?token=${verificationToken}`;

		// TODO - Move to MailController
		// Send verification email (use your MailerService)
		await this.mailerService.sendMail({
			to: [{ name: `${user.firstName} ${user.lastName}`, address: user.email }],
			subject: "Verify your email",
			template: "verify-email",
			context: {
				name: `${user.firstName} ${user.lastName}`,
				link: verifyUrl,
			},
		});

		return {
			message: "System initialised successfully",
			user: user,
			organization: organization,
			role: role,
		};
	}

	/**
	 * Check if user and organisation exists
	 * @returns boolean
	 */
	async checkInitialisation() {
		const countUser = await this.UsersRepository.count();
		const countOrganisation = await this.OrganisationRepository.count({ where: { isDeleted: false } });
		const isInitialised = countUser > 0 && countOrganisation > 0;
		return {
			isInitialised: isInitialised,
			message: isInitialised ? "Initial setup already fulfilled" : "Initial setup not fulfilled",
		};
	}
}
