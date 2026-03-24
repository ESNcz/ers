import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CookieGuard } from "../auth/providers/guards";
import { Permission, Role, RolesService } from "./index";
import { CurrentUser } from "../../decorators";
import { User, UsersService } from "../users";
import { CreateRole } from "../../models/requests/create-role.dto";

@ApiTags("Roles")
@ApiBearerAuth()
@UseGuards(CookieGuard)
@Controller("roles")
export class RolesController {
	constructor(
		private readonly userService: UsersService,
		private readonly rolesService: RolesService,
	) {}

	@ApiCreatedResponse({ type: Role, description: "Created role" })
	@Post("create")
	async createRole(@CurrentUser() user: User, @Body() body: CreateRole) {
		const role = new Role({
			name: body.name,
			permissions: body.permissions,
		});

		return await this.rolesService.save(role);
	}

	@Patch("update/:userId/:roleId")
	async updateUserRole(
		@CurrentUser() currentUser: User,
		@Param("userId", ParseUUIDPipe) userId: string,
		@Param("roleId", ParseIntPipe) roleId: number,
	) {
		if (!currentUser.role?.hasPermission(Permission.UserUpdateRole)) {
			throw new ForbiddenException("You dont have permissions to update role");
		}

		const foundUser = await this.userService.findById(userId);
		if (!foundUser) throw new NotFoundException("User not found");

		const foundRole = await this.rolesService.findById(roleId);
		if (!foundRole) throw new NotFoundException("Role not found");

		foundUser.role = foundRole;
		return await this.userService.save(foundUser);
	}

	@Patch("remove-role/:userId")
	async removeUserRole(
		@CurrentUser() currentUser: User,
		@Param("userId", ParseUUIDPipe) userId: string,
	) {
		if (!currentUser.role?.hasPermission(Permission.UserUpdateRole)) {
			throw new ForbiddenException("You dont have permissions to update role");
		}

		const foundUser = await this.userService.findById(userId);
		if (!foundUser) throw new NotFoundException("User not found");

		foundUser.role = null;
		return await this.userService.save(foundUser);
	}

	/**
	 * All available roles to assign
	 */
	@ApiOkResponse({ type: [Role] })
	@Get()
	getAllRoles() {
		return this.rolesService.findAll();
	}

	/**
	 * Get all allowed permissions registered in system
	 */
	@ApiOkResponse({
		description: "Returns permissions",
		schema: {
			type: "array",
			items: {
				type: "string",
				enum: Object.values(Permission), // Include all enum values
			},
		},
	})
	@Get("permissions")
	getRoleAllPermissions() {
		return Object.values(Permission);
	}
}
