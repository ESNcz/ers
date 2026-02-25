import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcryptjs";
import { isEmail } from "class-validator";
import { FindManyOptions, FindOptionsWhere, In, Repository } from "typeorm";
import type { PaginationOptions } from "utilities/nest/decorators";
import { formatPaginatedResponse } from "utilities/pagination.helper";
import { User } from "./entities";

type UserId = User["id"];

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly UsersRepository: Repository<User>,
	) {}

	/**
	 * Save user entity
	 * @param user
	 * @returns
	 */
	save(user: User) {
		return this.UsersRepository.save(user);
	}

	/**
	 * Find user by ID
	 * @param id ID
	 * @param options
	 * @returns
	 */
	findById(id: UserId, options?: FindManyOptions<User>) {
		return this.UsersRepository.findOne({
			where: { id },
			relations: options?.relations,
		});
	}

	/**
	 * Find many users by IDs
	 * @param ids IDs
	 * @param options Find options
	 * @returns
	 */
	findManyById(ids: string[], options?: FindManyOptions<User>) {
		return this.UsersRepository.find({
			where: { id: In(ids) },
			relations: options?.relations,
		});
	}

	/**
	 * Find user by email and select password column
	 * @param email User email
	 * @returns
	 */
	findByEmailWithPassword(email: User["email"]): Promise<User | null> {
		return this.UsersRepository.createQueryBuilder("user")
			.addSelect("user.password")
			.where("LOWER(user.email) = LOWER(:email)", { email }) // Check the email in lower case --> case-insensitive
			.getOne();
	}

	/**
	 * Find user by username and select password column
	 * @param username User username
	 * @returns
	 */
	findByUsernameWithPassword(username: User["username"]): Promise<User | null> {
		return this.UsersRepository.createQueryBuilder("user")
			.addSelect("user.password")
			.where("user.username = :username", { username })
			.getOne();
	}

	/**
	 * Find user by username or password
	 *
	 * Is shorthand to `findByEmaiWithPassword` and `findByUsernameWithPasword` by checking if value is email or username
	 * @param usernameOrEmail
	 * @returns
	 */
	findByUsernameOrEmailWithPassword(usernameOrEmail: string) {
		return isEmail(usernameOrEmail)
			? this.findByEmailWithPassword(usernameOrEmail)
			: this.findByUsernameWithPassword(usernameOrEmail);
	}

	/**
	 * Find all users ordered by lastName
	 * @returns FormatPaginatedResponseType<User[]>
	 */
	async find(pagination?: PaginationOptions, options?: FindManyOptions<User>) {
		const [users, totalCount] = await this.UsersRepository.findAndCount({
			order: { createdAt: "ASC" },
			where: {
				isDeleted: false,
			},
			relations: {
				...options?.relations,
			},
			// TODO - fix apgination if "all" is undefined fetch all
			take: pagination.all ? undefined : pagination.perPage,
			skip: pagination.all ? undefined : (pagination.page - 1) * pagination.perPage,
		});

		return formatPaginatedResponse<User>(users, totalCount, pagination);
	}

	/**
	 * Checks if user with specific criterial already exist
	 * Is better to index criteria columns
	 * @param criteria Criteria
	 * @returns
	 */
	exist(criteria: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
		return this.UsersRepository.existsBy(criteria);
	}

	/**
	 * Deleting user anonymizes user data but keep the row and all relations.
	 */
	async deleteUser(id: string): Promise<User> {
		const user = await this.UsersRepository.findOne({
			where: { id },
			relations: { personalAddress: true, photo: true, role: true },
		});

		if (!user) {
			throw new NotFoundException("User not found");
		}

		const deletedUserId = user.id;

		// Replace personal data
		user.email = `deleted+${deletedUserId}`;
		user.username = `deleted_${deletedUserId}`;
		user.firstName = "Deleted";
		user.lastName = "User";
		// user.birthDate = null;
		// user.nationality = "";
		user.phonePrefix = "+123";
		user.phoneNumber = "123456789";
		// user.gender = null;
		// user.pronouns = null;
		user.personalAddress = null;

		// Remove photo, role, etc. as desired
		user.photo = null;
		user.role = null;

		// Disable login
		user.isVerified = false;
		user.isDeleted = true;

		// Set password to a random, unusable value
		const randomPassword = randomUUID();
		user.password = await bcrypt.hash(randomPassword, 10);

		return this.UsersRepository.save(user);
	}
}
