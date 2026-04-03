import {
	Body,
	ConflictException,
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiTags,
} from "@nestjs/swagger";

import { OrganizationService } from "./index";
import { CookieGuard } from "../auth/providers/guards";
import { User } from "../users";
import { CurrentUser } from "@api/decorators";
import { Permission } from "@api/modules/roles";
import { RespondJoinRequest } from "@api/models/requests";
import { JoinRequestStatus, OrganizationJoinRequest } from "./entities";

@ApiTags("Organization join requests")
@Controller()
export class OrganizationJoinRequestsController {
	constructor(private readonly organizationService: OrganizationService) {}

	/**
	 * User requests to join an organization
	 */
	@ApiCreatedResponse({ type: OrganizationJoinRequest, description: "Join request created" })
	@ApiNotFoundResponse({ description: "Organization not found" })
	@ApiConflictResponse({ description: "Already a member or pending request exists" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Post("organization/:id/join-requests")
	async createJoinRequest(@CurrentUser() currentUser: User, @Param("id") organizationId: string) {
		const organization = await this.organizationService.findById(organizationId);
		if (!organization) throw new NotFoundException("Organization not found");

		// Check if user is already a member
		const existingMember = await this.organizationService.findMemberByUserId(organizationId, currentUser.id);
		if (existingMember) throw new ConflictException("You are already a member of this organization");

		// Check if user already has a pending request
		const existingRequest = await this.organizationService.findPendingJoinRequest(organizationId, currentUser.id);
		if (existingRequest) throw new ConflictException("You already have a pending request for this organization");

		return this.organizationService.createJoinRequest(organization, currentUser);
	}

	/**
	 * Get all join requests for an organization (manager/admin only)
	 */
	@ApiOkResponse({ type: [OrganizationJoinRequest], description: "List of join requests for the organization" })
	@ApiNotFoundResponse({ description: "Organization not found" })
	@ApiForbiddenResponse({ description: "No permission to view join requests" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Get("organization/:id/join-requests")
	async getOrganizationJoinRequests(@CurrentUser() currentUser: User, @Param("id") organizationId: string) {
		const organization = await this.organizationService.findById(organizationId);
		if (!organization) throw new NotFoundException("Organization not found");

		if (
			!(
				organization.manager?.id === currentUser.id ||
				currentUser.role?.hasOneOfPermissions([Permission.OrganisationManageJoinRequests])
			)
		) {
			throw new ForbiddenException("You don't have permission to view join requests");
		}

		return this.organizationService.findJoinRequestsOf(organizationId);
	}

	/**
	 * Accept or reject a join request (manager/admin only)
	 */
	@ApiOkResponse({ type: OrganizationJoinRequest, description: "Join request has been processed" })
	@ApiNotFoundResponse({ description: "Join request not found" })
	@ApiConflictResponse({ description: "Request already processed" })
	@ApiForbiddenResponse({ description: "No permission to manage join requests" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Patch("organization/join-requests/:requestId")
	async respondToJoinRequest(
		@CurrentUser() currentUser: User,
		@Param("requestId", ParseIntPipe) requestId: number,
		@Body() body: RespondJoinRequest,
	) {
		const joinRequest = await this.organizationService.findJoinRequestById(requestId);
		if (!joinRequest) throw new NotFoundException("Join request not found");

		if (joinRequest.status !== JoinRequestStatus.Pending) {
			throw new ConflictException("This request has already been processed");
		}

		const organization = joinRequest.organization;
		if (
			!(
				organization.manager?.id === currentUser.id ||
				currentUser.role?.hasOneOfPermissions([Permission.OrganisationManageJoinRequests])
			)
		) {
			throw new ForbiddenException("You don't have permission to manage join requests");
		}

		if (body.status === JoinRequestStatus.Accepted) {
			return this.organizationService.acceptJoinRequest(joinRequest, currentUser);
		}

		return this.organizationService.rejectJoinRequest(joinRequest, currentUser);
	}

	/**
	 * Get all join requests sent by the current user
	 */
	@ApiOkResponse({ type: [OrganizationJoinRequest], description: "List of join requests sent by current user" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Get("users/me/join-requests")
	async getMyJoinRequests(@CurrentUser() currentUser: User) {
		return this.organizationService.findUserJoinRequests(currentUser.id);
	}
}
