import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "@api/decorators";
import { CreateOrganization, UpdateOrganization } from "@api/models/requests";
import { Address } from "@api/modules/addresses/entities";
import { CookieGuard } from "../auth/providers/guards";
import { Permission } from "../roles";
import { User } from "../users";
import { Organization, OrganizationService } from "./index";

@ApiTags("Organizations")
@Controller("organizations")
export class OrganizationsController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Get()
	allOrganizations() {
		return this.organizationService.findAll();
	}

	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Get(":id")
	async getOrganisationById(@Param("id", ParseUUIDPipe) id: string) {
		const organization = await this.organizationService.findById(id);
		if (!organization) throw new NotFoundException("Organization not found");

		return organization;
	}

	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Post()
	createOrganization(@CurrentUser() currentUser: User, @Body() body: CreateOrganization) {
		if (!currentUser.role?.hasOneOfPermissions([Permission.OrganisationCreate])) {
			throw new UnauthorizedException("You don't have permission to perform this action");
		}

		const organization = new Organization();
		const { address } = body;

		organization.name = body.name;
		organization.legalName = body.legalName;
		organization.cin = body?.cin ?? null;
		organization.vatin = body?.vatin ?? null;
		organization.address = new Address({
			city: address.city,
			houseNumber: address.houseNumber,
			country: address.country,
			street: address.street,
			zip: address.zip,
		});

		return this.organizationService.save(organization);
	}

	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Post(":id")
	async updateOrganization(
		@CurrentUser() currentUser: User,
		@Param("id", ParseUUIDPipe) id: string,
		@Body() body: UpdateOrganization,
	) {
		if (!currentUser.role?.hasOneOfPermissions([Permission.OrganisationUpdate])) {
			throw new UnauthorizedException("You don't have permission to perform this action");
		}

		const organization = await this.organizationService.findById(id);
		if (!organization) throw new NotFoundException("Organization not found");

		organization.name = body.name ?? organization.name;
		organization.legalName = body.legalName ?? organization.legalName;
		organization.cin = body?.cin ?? organization.cin;
		organization.vatin = body?.vatin ?? organization.vatin;

		if (body.address) {
			organization.address.update(body.address);
		}

		return this.organizationService.save(organization);
	}

	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Post(":organisationId/:userId")
	async transferManager(
		@CurrentUser() currentUser: User,
		@Param("organisationId", ParseUUIDPipe) organisationId: string,
		@Param("userId", ParseUUIDPipe) userId: string,
	) {
		const organization = await this.organizationService.findById(organisationId);

		if (
			!(organization?.manager?.id === currentUser?.id || currentUser.role?.hasPermission(Permission.OrganisationUpdate))
		) {
			throw new UnauthorizedException("You don't have permission to perform this action");
		}

		const organisationMember = await this.organizationService.findMemberByUserId(organisationId, userId, {
			relations: { user: true },
		});

		organization.update({ manager: organisationMember.user });
		return await this.organizationService.save(organization);
	}

	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Delete(":id")
	async deleteOrganization(@CurrentUser() currentUser: User, @Param("id", ParseUUIDPipe) id: string) {
		if (!currentUser.role?.hasOneOfPermissions([Permission.OrganisationUpdate])) {
			throw new UnauthorizedException("You don't have permission to perform this action");
		}

		return this.organizationService.delete(id);
	}
}
