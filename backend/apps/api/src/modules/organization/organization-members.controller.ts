import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiQuery, ApiTags, getSchemaPath } from "@nestjs/swagger";

import { CurrentUser } from "@api/decorators";
import { AddOrganizationMembers } from "@api/models/requests";
import { PaginationDto, PaginationResponseDto } from "@api/models/responses/pagination-response.dto";
import { CookieGuard } from "@api/modules/auth/providers/guards";
import { Permission } from "@api/modules/roles";
import { User, UsersService } from "@api/modules/users";
import { Pagination, PaginationOptions } from "utilities/nest/decorators";
import { formatPaginatedResponse } from "utilities/pagination.helper";

import { OrganizationMember } from "./entities";
import { OrganizationService } from "./index";

const MEMBER_CANDIDATES_LIMIT = 20;

@ApiTags("Organization members")
@Controller("organization/:id")
export class OrganizationMembersController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly usersService: UsersService,
  ) {}

  @ApiExtraModels(OrganizationMember, PaginationResponseDto<OrganizationMember>)
  @ApiOkResponse({
    description: "All members within organization",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(OrganizationMember) },
            },
            pagination: { $ref: getSchemaPath(PaginationDto) },
          },
        },
      },
    },
  })
  @Get("members")
  organizationMembers(@Param("id") organizationId: string, @Pagination() pagination?: PaginationOptions) {
    return this.organizationService.findMembersOf(organizationId, pagination);
  }

  /**
   * Search users that can be added to the organization - users who are not its members yet.
   * Matches first name, last name, full name, username or email, returns at most 20 users.
   *
   * Only organization manager or users with `organisation.addUser` permission can search.
   */
  @ApiBearerAuth()
  @ApiQuery({ name: "search", required: true, type: String })
  @ApiExtraModels(User, PaginationResponseDto<User>)
  @ApiOkResponse({
    description: "Users who are not members of the organization",
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
  @UseGuards(CookieGuard)
  @Get("members/candidates")
  async organizationMemberCandidates(
    @CurrentUser() currentUser: User,
    @Param("id") organizationId: string,
    @Query("search") search?: string,
  ) {
    const searchText = search?.trim();
    if (!searchText) throw new BadRequestException("Search text is required");

    const organization = await this.organizationService.findById(organizationId);
    if (!organization) throw new NotFoundException("Organization not found");

    if (!(
      organization.manager?.id === currentUser.id ||
      currentUser.role?.hasOneOfPermissions([Permission.OrganisationAddUser])
    )) {
      throw new ForbiddenException("User does not have required permissions");
    }

    const { users, totalCount } = await this.usersService.findOrganizationMemberCandidates(
      organizationId,
      searchText,
      MEMBER_CANDIDATES_LIMIT,
    );
    return formatPaginatedResponse(users, totalCount, { page: 1, perPage: MEMBER_CANDIDATES_LIMIT });
  }

  /**
   * Add members to organization
   */
  @ApiBearerAuth()
  @UseGuards(CookieGuard)
  @Post("members")
  async addOrganizationMembers(
    @CurrentUser() currentUser: User,
    @Param("id") organizationId: string,
    @Body() body: AddOrganizationMembers,
  ) {
    const organization = await this.organizationService.findById(organizationId);
    if (!organization) throw new NotFoundException("Organization not found");

    if (
      organization.manager?.id === currentUser.id ||
      currentUser.role?.hasOneOfPermissions([Permission.OrganisationAddUser])
    ) {
      const memberIds = organization.members.map((member) => member.user.id);
      const unassignedMemberIds = body.userIds.filter((userId) => !memberIds.includes(userId));
      const newMembers = await this.usersService.findManyById(unassignedMemberIds);

      return this.organizationService.addMembers(organization, newMembers);
    }

    throw new ForbiddenException("User does not have required permissions");
  }

  /**
   * Delete members from organization (`member.id` not `user.id`)
   */
  @ApiBearerAuth()
  @UseGuards(CookieGuard)
  @Delete("members/:memberId")
  async deleteOrganizationMembers(
    @CurrentUser() currentUser: User,
    @Param("id") organisationId: string,
    @Param("memberId") organisationMemberId: string,
  ) {
    const organization = await this.organizationService.findById(organisationId);
    if (!organization) throw new NotFoundException("Organization not found");

    if (!(
      organization.manager?.id === currentUser.id ||
      currentUser.role?.hasOneOfPermissions([Permission.OrganisationDeleteUser])
    )) {
      throw new ForbiddenException("User does not have required permissions");
    }
    const organisationMember = organization.members.find((member) => member.id.toString() === organisationMemberId);
    if (!organisationMember) throw new NotFoundException("Member not found in organization");

    if (organization.manager !== null && organization.manager.id === organisationMember.user.id) {
      await this.organizationService.deleteOrganisationManager(organization.id);
    }

    return await this.organizationService.deleteMembers(organisationMemberId);
  }
}
