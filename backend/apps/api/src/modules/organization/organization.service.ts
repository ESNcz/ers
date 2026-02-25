import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
import { Organization, OrganizationMember } from "./entities";
import { User } from "../users";
import type { PaginationOptions } from "utilities/nest/decorators";
import { formatPaginatedResponse } from "utilities/pagination.helper";

@Injectable()
export class OrganizationService {
	constructor(
		@InjectRepository(Organization)
		private readonly organizationRepository: Repository<Organization>,
		@InjectRepository(OrganizationMember)
		private readonly memberRepository: Repository<OrganizationMember>,
		@InjectEntityManager()
		private readonly entityManager: EntityManager,
	) {}

	/**
	 * Find organization by ID
	 * @param id Organization ID
	 * @returns
	 */
	findById(id: string) {
		return this.organizationRepository.findOne({
			where: {
				id: id,
				isDeleted: false,
			},
			relations: {
				manager: true,
				members: {
					user: true,
				},
			},
		});
	}

	/**
	 * Save organization data
	 * @param data
	 * @returns
	 */
	save(data: Partial<Organization>) {
		return this.organizationRepository.save(data);
	}

	/**
	 * Find all organizations
	 * @returns Organization[] Organizations
	 */
	findAll() {
		return this.organizationRepository.find({
			where: {
				isDeleted: false,
			},
			relations: {
				manager: true,
			},
			order: { name: "ASC" },
		});
	}

	/**
	 * Find all members of organization
	 * @param id Organization ID
	 * @param pagination Pagination
	 * @returns {OrganizationMember[]} Members
	 */
	async findMembersOf(id: string, pagination?: PaginationOptions) {
		const [members, totalCount] = await this.memberRepository.findAndCount({
			where: {
				organization: {
					id,
					isDeleted: false,
				},
			},
			relations: {
				user: {
					personalAddress: true,
				},
			},
			take: pagination?.all ? pagination.perPage : undefined,
			skip: pagination?.all ? (pagination.page - 1) * pagination.perPage : undefined,
		});
		return await formatPaginatedResponse<OrganizationMember>(members, totalCount, pagination);
	}

	/**
	 * Find organization user membership
	 * @param organizationId Organization ID
	 * @param userId User ID
	 * @param options
	 * @returns OrganizationMember | null Membership
	 */
	findMemberByUserId(organizationId: string, userId: string, options?: FindOneOptions<OrganizationMember>) {
		return this.memberRepository.findOne({
			where: {
				organization: {
					id: organizationId,
					isDeleted: false,
				},
				user: {
					id: userId,
				},
			},
			...options,
		});
	}

	/**
	 * Find memberships where user is member of
	 * @param userId User ID
	 // * @param options Find options
	 * @returns OrganizationMember[]
	 */
	findUserMemberships(userId: string) {
		//, options?: FindManyOptions
		return this.memberRepository.find({
			where: {
				user: { id: userId },
				organization: { isDeleted: false },
			},
			relations: {
				organization: {
					manager: true,
					address: true,
				},
			},
			// ...options,
		});
	}

	/**
	 * Add new members to the organization
	 * @param organization Organization
	 * @param addMembers Members
	 * @returns
	 */
	async addMembers(organization: Organization, addMembers: User[]) {
		return this.entityManager.transaction(async (em) => {
			return em.save(addMembers.map((user) => em.create(OrganizationMember, { user, organization })));
		});
	}

	/**
	 * Delete members by ID
	 * @param memberId Member Ids
	 */
	async deleteMembers(memberId: string) {
		return this.entityManager.transaction(async (em) => {
			return await em
				.createQueryBuilder()
				.delete()
				.from(OrganizationMember)
				.where("id = :memberId", { memberId: memberId })
				.execute();
		});
	}

	/**
	 * Delete manager from organisation
	 * @param organisationId organisation ID
	 */
	async deleteOrganisationManager(organisationId: string) {
		return this.entityManager.transaction(async (em) => {
			const organization = await em.findOne(Organization, {
				where: { id: organisationId },
				relations: {
					manager: true,
				},
			});
			if (!organization) {
				throw new NotFoundException("Organization not found");
			}
			organization.manager = null;
			return await em.save(organization);
		});
	}

	/**
	 * Soft delete organisation
	 * @param organisationId organisation ID
	 */
	async delete(organisationId: string) {
		const organization = await this.findById(organisationId);
		if (!organization) {
			throw new NotFoundException("Organization not found");
		}
		organization.isDeleted = true;
		return await this.organizationRepository.save(organization);
	}
}
