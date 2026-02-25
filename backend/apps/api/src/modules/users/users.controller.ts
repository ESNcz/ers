import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	Header,
	InternalServerErrorException,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConsumes,
	ApiCreatedResponse,
	ApiExtraModels,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiTags,
	getSchemaPath,
} from "@nestjs/swagger";
import { FormDataRequest, MemoryStoredFile } from "nestjs-form-data";

import { OrganizationService } from "../organization";
import { PhotoService } from "../photo";
import { User, UsersService } from "./index";

import { CurrentUser } from "@api/decorators";
import { CreateUser, UpdatePhoto, UpdateUser } from "@api/models/requests";
import { OrganizationMemberWithoutUser } from "@api/models/responses";
import { PaginationDto, PaginationResponseDto } from "@api/models/responses/pagination-response.dto";
import { Address } from "@api/modules/addresses/entities";
import { AuthService } from "@api/modules/auth";
import { Permission } from "@api/modules/roles";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import * as ExcelJS from "exceljs";
import { Pagination, PaginationOptions } from "utilities/nest/decorators";
import { CookieGuard } from "../auth/providers/guards";

@ApiTags("Users")
@Controller("users")
export class UsersController {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
		private readonly photoService: PhotoService,
		private readonly organizationService: OrganizationService,
		private readonly mailerService: MailerService,
	) {}

	@ApiCreatedResponse({ type: User, description: "User has been created" })
	@Post()
	async createUser(@Body() body: CreateUser) {
		const lowerCaseUsername = body.username.toLowerCase();
		const exist = await this.usersService.exist([{ email: body.email }, { username: lowerCaseUsername }]);
		if (exist) throw new ConflictException("User with email or username already exist");

		let newUser = new User({
			email: body.email,
			password: body.password,
			firstName: body.firstName,
			lastName: body.lastName,
			username: lowerCaseUsername,
			gender: body.gender,
			birthDate: body.birthDate,
			nationality: body.nationality,
			phonePrefix: body.phonePrefix,
			phoneNumber: body.phoneNumber,
		});

		if (body.personalAddress) {
			const { personalAddress: address } = body;
			newUser.personalAddress = new Address({
				city: address.city,
				country: address.country,
				houseNumber: address.houseNumber,
				street: address.street,
				zip: address.zip,
			});
		}

		newUser = await this.usersService.save(newUser);
		newUser.password = undefined;

		const verificationToken = await this.authService.createEmailVerificationToken(newUser);
		const verifyUrl = `${this.configService.getOrThrow("WEB_DOMAIN")}/verify?token=${verificationToken}`;

		// TODO - Move to MailController
		// Send verification email (use your MailerService)
		await this.mailerService.sendMail({
			to: [{ name: `${newUser.firstName} ${newUser.lastName}`, address: newUser.email }],
			subject: "Verify your email",
			template: "verify-email",
			context: {
				name: `${newUser.firstName} ${newUser.lastName}`,
				link: verifyUrl,
			},
		});

		return newUser;
	}

	/**
	 * Update user data
	 */
	@ApiBadRequestResponse({ description: "Username is already taken" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Patch()
	async updateCurrentUser(@Body() body: UpdateUser, @CurrentUser() requestUser: User) {
		const lowerCaseUsername = body?.username.toLowerCase();
		if (body.username && lowerCaseUsername !== requestUser.username) {
			const exists = await this.usersService.exist({ username: lowerCaseUsername });
			if (exists) throw new BadRequestException("Username is already taken");
		}

		const user = await this.usersService.findById(requestUser.id, {
			relations: { personalAddress: true },
		});

		// For safety reasons set each property individually
		user.password = body.password ?? user.password;
		user.firstName = body.firstName ?? user.firstName;
		user.lastName = body.lastName ?? user.lastName;
		user.username = lowerCaseUsername ?? user.username;
		user.gender = body.gender ?? user.gender;
		user.pronouns = body.pronouns ?? user.pronouns;
		user.birthDate = body.birthDate ?? user.birthDate;
		user.nationality = body.nationality ?? user.nationality;
		user.phonePrefix = body.phonePrefix ?? user.phonePrefix;
		user.phoneNumber = body.phoneNumber ?? user.phoneNumber;

		if (body.personalAddress) {
			if (user.personalAddress) user.personalAddress.update(body.personalAddress);
			else user.personalAddress = new Address(body.personalAddress);
		}

		const newUser = await this.usersService.save(user);
		newUser.password = undefined;
		return newUser;
	}

	@ApiOkResponse({ type: User, description: "Current user data" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Get()
	async getCurrentUser(@CurrentUser() user: User) {
		return this.usersService.findById(user.id, {
			relations: { photo: true, personalAddress: true },
		});
	}

	@ApiConsumes("multipart/form-data")
	@FormDataRequest({ storage: MemoryStoredFile })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Patch("photo")
	async updateCurrentUserPhoto(@CurrentUser() user: User, @Body() body: UpdatePhoto) {
		const photo = await this.photoService.save(body.file.buffer, "user_photo");
		if (!photo) throw new InternalServerErrorException();

		user.photo = photo;
		return this.usersService.save(user);
	}

	@ApiOkResponse({
		type: [OrganizationMemberWithoutUser],
		description: "All organizations where user is member of",
	})
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Get(":id/organizations")
	userOrganizationMemberships(@Param("id", ParseUUIDPipe) userId: string) {
		//, @Pagination() pagination: PaginationOptions
		return this.organizationService.findUserMemberships(userId);
	}

	/**
	 * Find all users ordered by `lastName`.
	 */
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@ApiExtraModels(User, PaginationResponseDto<User>)
	@ApiOkResponse({
		description: "Get all users",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						data: {
							type: "array",
							items: { $ref: getSchemaPath(User) },
						},
						pagination: { $ref: getSchemaPath(PaginationDto) },
					},
				},
			},
		},
	})
	@Get("all")
	getAllUsers(@Pagination() pagination?: PaginationOptions) {
		return this.usersService.find(pagination, { relations: { personalAddress: true, role: true } });
	}

	/**
	 * Delete (anonymize) user.
	 * Users are not getting deleted but their data are replaced with non-identifiable placeholders
	 */
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@ApiNoContentResponse({
		description: "User has been deleted or anonymized",
	})
	@Delete(":id")
	async deleteUser(@CurrentUser() currentUser: User, @Param("id", ParseUUIDPipe) userId: string): Promise<void> {
		if (!currentUser.role?.hasOneOfPermissions([Permission.UserDelete]) && currentUser.id !== userId) {
			throw new UnauthorizedException("You don't have permission to perform this action");
		}

		await this.usersService.deleteUser(userId);
	}

	@Header("Content-disposition", "attachment; filename=EventApplicationExport.xlsx")
	@Get("export/users")
	async generateSheetUsers(@Res() res: Response) {
		const userList = await this.usersService.find(
			{ all: true },
			{
				relations: {
					personalAddress: true,
					role: true,
				},
			},
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Export");

		worksheet.columns = [
			{ header: "First Name", key: "firstName" },
			{ header: "Last Name", key: "lastName" },
			{ header: "Email", key: "email" },
			{ header: "Username", key: "username" },
			{ header: "Personal Address", key: "personalAddress" },

			{ header: "Birthdate", key: "birthDate" },
			{ header: "Nationality", key: "nationality" },
			{ header: "Phone Prefix", key: "phonePrefix" },
			{ header: "Phone Number", key: "phoneNumber" },
			{ header: "Gender", key: "gender" },

			{ header: "Role", key: "role" },
			{ header: "Role Permissions", key: "rolePermissions" },
		];

		userList.data.map((user) => {
			worksheet.addRow({
				firstName: user?.firstName,
				lastName: user?.lastName,
				email: user?.email,
				username: user?.username,
				personalAddress: user?.personalAddress
					? `${user?.personalAddress?.street} ${user?.personalAddress?.houseNumber}
${user?.personalAddress?.zip} ${user?.personalAddress?.city}
${user?.personalAddress?.country}`
					: "",
				birthDate: user?.birthDate,
				nationality: user?.nationality,
				phonePrefix: user?.phonePrefix,
				phoneNumber: user?.phoneNumber,
				gender: user?.gender,
				role: user?.role?.name,
				rolePermissions: user?.role?.permissions.toString(),
			});
		});

		const buffer = await workbook.xlsx.writeBuffer();
		res
			// @ts-ignore
			.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
			.send(buffer);
		return buffer;
	}
}
