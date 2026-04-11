import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  NotFoundException,
  NotImplementedException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";

import { ajv } from "utilities/ajv";
import { ParseDatePipe } from "utilities/nest/pipes";
import { CookieGuard } from "../auth/providers/guards";
import { FileStorageService } from "../file-storage";
import { OrganizationService } from "../organization";
import { User, UsersService } from "../users";
import { EventApplication, EventCustomOrganization } from "./entities";
import { EventApplicationsService, EventSpotsService, EventsService } from "./index";

import { CurrentUser } from "@api/decorators";
import { EventApplicationSimpleWithApplicationsMapper } from "@api/mappers";
import { CreateEventApplication, UpdateEventApplication } from "@api/models/requests";
import { EventApplicationSimpleWithApplications } from "@api/models/responses";
import {
  EventApplicationDetailedWithApplications,
} from "@api/models/responses/event-application-detailed-with-applications.dto";
import { PaginationDto, PaginationResponseDto } from "@api/models/responses/pagination-response.dto";
import { Address } from "@api/modules/addresses/entities";
import { UpdateApplicationSlotDto } from "@api/modules/events/dto/update-application-slot.dto";
import { UpdateEventApplicationPrioritiesDto } from "@api/modules/events/dto/update-event-application-priorities.dto";
import { Permission } from "@api/modules/roles";
import * as ExcelJS from "exceljs";
import { dayMonthYear } from "utilities/time";

@ApiTags("Event applications")
@Controller("events")
export class EventApplicationsController {
	constructor(
		private readonly eventApplicationsService: EventApplicationsService,
		private readonly eventService: EventsService,
		private readonly usersService: UsersService,
		private readonly organizationService: OrganizationService,
		private readonly eventSpotsService: EventSpotsService,
		private readonly fileStorageService: FileStorageService,

		private readonly eventApplicationSimpleWithApplicationsMapper: EventApplicationSimpleWithApplicationsMapper,
	) {}

	/**
	 * Get all signed-in user applications
	 *
	 * For filtering look at {@link EventsController}
	 */
	@ApiBearerAuth()
	@ApiQuery({ name: "sinceSince", required: false, type: Number })
	@ApiQuery({ name: "toSince", required: false, type: Number })
	@ApiExtraModels(EventApplication, PaginationResponseDto<EventApplication>)
	@ApiOkResponse({
		description: "All Events",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						data: {
							type: "array",
							items: { $ref: getSchemaPath(EventApplication) },
						},
						pagination: { $ref: getSchemaPath(PaginationDto) },
					},
				},
			},
		},
	})
	@UseGuards(CookieGuard)
	@Get("applications")
	async getUserApplications(
		@CurrentUser() user: User,
		@Query("sinceSince", ParseDatePipe) since?: Date,
		@Query("toSince", ParseDatePipe) to?: Date,
	) {
		return await this.eventApplicationsService.findByUserIdDetailed(user.id, {
			filter: { to, since },
			relations: { event: { applications: true } },
		});
	}

	/**
	 * Get all event user applications
	 * @param eventId
	 * @returns
	 */
	@ApiBearerAuth()
	@ApiOkResponse({ type: [EventApplicationDetailedWithApplications] })
	@UseGuards(CookieGuard)
	@Get(":eventId/applications")
	async getEventApplications(@Param("eventId", ParseIntPipe) eventId: number) {
		const application = await this.eventApplicationsService.findByEventIdDetailed(eventId, {
			relations: { event: { applications: true } },
		});
		return this.eventApplicationSimpleWithApplicationsMapper.map(application);
	}

	/**
	 * Get all event user applications
	 * @returns
	 * @param applicationId
	 */
	@ApiBearerAuth()
	@ApiOkResponse({ type: [EventApplicationDetailedWithApplications] })
	@UseGuards(CookieGuard)
	@Get("application/:applicationId")
	async getApplication(@Param("applicationId", ParseIntPipe) applicationId: number) {
		return await this.eventApplicationsService.findById(applicationId);
	}

	/**
	 * Create an event application
	 */
	@ApiConflictResponse({
		description: "Event application for user already exist",
	})
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Post(":eventId/applications")
	async createUserApplication(
		@CurrentUser() currentUser: User,
		@Param("eventId", ParseIntPipe) eventId: number,
		@Body() body: CreateEventApplication,
	): Promise<EventApplicationSimpleWithApplications> {
		const exist = await this.eventApplicationsService.exist(eventId, currentUser.id);
		if (exist) throw new ConflictException("Event application already exist");

		const user = await this.usersService.findById(currentUser.id, {
			relations: { personalAddress: true },
		});

		if (!user.personalAddress) throw new ForbiddenException("User must have valid personal address");

		let application = new EventApplication({
			user: currentUser,
			personalAddress: user.personalAddress.copy(),
			invoiceMethod: body.invoiceMethod,
			invoicedTo: body.invoicedTo,
			additionalInformation: body.additionalInformation ?? "",
			allergies: body.allergies ?? "",
			foodRestriction: body.foodRestriction ?? "",
			healthLimitations: body.healthLimitations ?? "",
			invoiceAddress: new Address(body.invoiceAddress),
			validUntil: body.validUntil,
			idNumber: body.idNumber,
		});

		if (body.organization.type === "organization") {
			const member = await this.organizationService.findMemberByUserId(body.organization.id, currentUser.id, {
				relations: { organization: true },
			});

			if (!member) throw new BadRequestException("Invalid organization given");
			application.organization = member.organization;
		} else {
			application.customOrganization = new EventCustomOrganization({
				country: body.organization.country,
				name: body.organization.name,
			});
		}

		const event = await this.eventService.findById(eventId, {
			relations: { spotTypes: true, applications: true },
			select: { registrationForm: {}, id: true },
		});
		if (!event) throw new NotFoundException("Event not found");

		application.event = event;

		if (body.spotTypeId) {
			const spotType = event.spotTypes.find((e) => e.id === body.spotTypeId);
			if (!spotType) throw new NotFoundException("Spot type not found");

			application.spotType = spotType;
		}

		if (event.registrationForm) {
			const isFormValid = await ajv.validate(event.registrationForm, body.additionalFormData);

			if (!isFormValid) throw new BadRequestException("Registration form data are not valid");

			application.additionalData = body.additionalFormData;
		}

		// Hard-coded invoice
		application = await this.eventApplicationsService.save(application);
		return this.eventApplicationSimpleWithApplicationsMapper.map(application);
	}

	/**
	 * Update event application
	 *
	 * @param currentUser
	 * @param applicationId Event Application ID
	 * @param body
	 * @returns
	 */
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Patch("application/:id")
	async updateEventApplication(
		@CurrentUser() currentUser: User,
		@Param("id", ParseIntPipe) applicationId: number,
		@Body() body: UpdateEventApplication,
	): Promise<EventApplicationSimpleWithApplications> {
		let application = await this.eventApplicationsService.findById(applicationId, {
			relations: {
				personalAddress: true,
				customOrganization: true,
				event: {
					applications: true,
				},
			},
		});
		if (!application) throw new NotFoundException("Event application not found");

		if (
			!(
				currentUser.role?.hasOneOfPermissions([Permission.EventManageApplications]) ||
				currentUser.id === application.user.id
			)
		) {
			throw new UnauthorizedException("You don't have permission to perform this action");
		}

		if (body.spotTypeId) {
			const eventSpot = await this.eventSpotsService.findById(body.spotTypeId);
			if (!eventSpot) throw new BadRequestException("Invalid event spot");

			application.spotType = eventSpot;
		}
		if (body.spotTypeId === null) application.spotType = null;

		if (body.invoiceAddress) application.personalAddress.update(body.invoiceAddress);

		application.invoicedTo = body.invoicedTo ?? application.invoicedTo;
		application.validUntil = body.validUntil ?? application.validUntil;
		application.idNumber = body.idNumber ?? application.idNumber;
		application.allergies = body.allergies ?? application.allergies;
		application.foodRestriction = body.foodRestriction ?? application.foodRestriction;
		application.healthLimitations = body.healthLimitations ?? application.healthLimitations;
		application.additionalInformation = body.additionalInformation ?? application.additionalInformation;

		application.invoiceMethod = body.invoiceMethod ?? application.invoiceMethod;

		if (body.organization.type === "organization") {
			// If this application was previously linked to a custom org, delete that custom org.
			if (application.customOrganization) {
				await this.eventApplicationsService.deleteCustomOrganizationInApplication(application.customOrganization);
				application.customOrganization = null;
			}

			const member = await this.organizationService.findMemberByUserId(body.organization.id, currentUser.id, {
				relations: { organization: true },
			});

			if (!member) throw new BadRequestException("Invalid organization given");
			application.organization = member.organization;
		} else {
			application.organization = null;

			if (application.customOrganization) {
				await this.eventApplicationsService.deleteCustomOrganizationInApplication(application.customOrganization);
			}

			application.customOrganization = new EventCustomOrganization({
				country: body.organization.country,
				name: body.organization.name,
			});
		}

		if (body.additionalFormData) {
			const event = await this.eventService.findById(application.event.id, {
				relations: { spotTypes: true },
				select: { registrationForm: {}, id: true },
			});
			if (!event) throw new NotFoundException("Event not found");

			if (event.registrationForm) {
				const isFormValid = await ajv.validate(event.registrationForm, body.additionalFormData);

				if (!isFormValid) throw new BadRequestException("Registration form data are not valid");

				application.additionalData = body.additionalFormData;
			}
		}

		application = await this.eventApplicationsService.save(application);
		return this.eventApplicationSimpleWithApplicationsMapper.map(application);
	}

	/**
	 * Delete event application by ID
	 */
	@ApiOkResponse({ description: "Event application deleted" })
	@ApiNotFoundResponse({ description: "Event application not found" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Delete("application/:id")
	async deleteEventApplication(@Param("id", ParseIntPipe) applicationId: number) {
		const application = await this.eventApplicationsService.findById(applicationId);
		if (!application) throw new NotFoundException("Event application not found");

		await this.eventApplicationsService.delete(application);
	}

	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Patch("applications/priorities")
	async updatePriorities(@CurrentUser() currentUser: User, @Body() body: UpdateEventApplicationPrioritiesDto) {
		const applicationIds = body.priorities.map((p) => p.applicationId);
		if (applicationIds.length === 0) return;

		const applications = await this.eventApplicationsService.findByIds(applicationIds, {
			relations: { organization: { manager: true } },
		});

		const canEdit = currentUser.role?.hasOneOfPermissions([Permission.EventManageApplications]);

		for (const application of applications) {
			const isManager = application.organization?.manager?.id === currentUser.id;
			if (!canEdit && !isManager) {
				throw new ForbiddenException(
					`You don't have permission to update priority for application ${application.id}`,
				);
			}
		}

		await this.eventApplicationsService.updatePriorities(body.priorities);
	}

	/**
	 * Get event application for user for event
	 */
	@ApiOkResponse({ type: EventApplicationSimpleWithApplications })
	@ApiNotFoundResponse({ description: "Event application not found" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Get(":eventId/applications/user/:userId")
	async getUserApplicationForEvent(
		@Param("eventId", ParseIntPipe) eventId: number,
		@Param("userId", ParseUUIDPipe) userId: string,
		@CurrentUser() user: User,
	) {
		if (user.id !== userId) throw new NotImplementedException("User cannot get application for another user yet");
		const application = await this.eventApplicationsService.findByEventAndUserId(eventId, userId);

		if (!application) throw new NotFoundException("Event application not found");

		return this.eventApplicationSimpleWithApplicationsMapper.map(application);
	}

	/**
	 * Update User Application Spot
	 */
	@ApiOkResponse({ type: EventApplicationSimpleWithApplications })
	@ApiNotFoundResponse({ description: "Event application not found" })
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@Patch(":applicationId/applications-spot")
	async updateUserApplicationSpot(
		@CurrentUser() currentUser: User,
		@Param("applicationId", ParseIntPipe) applicationId: number,
		@Body() body: UpdateApplicationSlotDto,
	) {
		const application = await this.eventApplicationsService.findById(applicationId);

		if (
			!(
				currentUser.id === application.user.id ||
				currentUser.role?.hasOneOfPermissions([Permission.EventManageApplications])
			)
		) {
			return;
		}

		if (!application) throw new NotFoundException("Event application not found");

		application.spotType = body.spotId === null ? null : await this.eventSpotsService.findById(body.spotId);
		await application.save();

		return application;
	}

	@ApiBearerAuth()
	@Header("Content-disposition", "attachment; filename=EventApplicationExport.xlsx")
	@Get("export/:eventId/applications")
	async generateSheetEventApplication(@Res() res: Response, @Param("eventId", ParseIntPipe) eventId: number) {
		const applicationList = await this.eventApplicationsService.findByEventId(eventId);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Export");

		worksheet.columns = [
			{ header: "Organisation Name", key: "organisation" },
			{ header: "Spot Name", key: "spotName" },
			{ header: "Spot Price", key: "spotPrice" },
			{ header: "Spot Price Currency", key: "spotPriceCurrency" },
			{ header: "Name", key: "firstname" },
			{ header: "Lastname", key: "lastname" },
			{ header: "E-mail", key: "email" },
			{ header: "Phone Number", key: "phone" },
			{ header: "Gender", key: "gender" },
			{ header: "Pronouns", key: "pronouns" },
			{ header: "Birthdate (dd.mm.yyyy)", key: "birthdate" },

			{ header: "Nationality", key: "nationality" },
			{ header: "ID / Passport Number", key: "idNumber" },
			{ header: "ID valid until", key: "idValidUntil" },
			{ header: "Personal Address", key: "personalAddress" },
			{ header: "Invoice Method", key: "invoiceMethod" },

			{ header: "Invoice Address", key: "invoiceAddress" },
			{ header: "Food Restrictions", key: "foodRestrictions" },
			{ header: "Allergies", key: "allergies" },
			{ header: "Disability or Health Limitations", key: "healthLimitations" },
			{ header: "Additional Information", key: "additionalInformation" },
		];

		applicationList.map((application) => {
			const { organization, user, spotType } = application;

			const invoicedTo =
				application?.invoiceMethod === "different"
					? `${application?.invoicedTo}`
					: application?.invoiceMethod === "organisation"
						? `${organization.name}`
						: `${user.firstName} ${user.lastName}`;

			worksheet.addRow({
				organisation: organization !== null ? application.organization.name : application.customOrganization?.name,
				spotName: spotType?.name,
				spotPrice: spotType?.price,
				spotPriceCurrency: spotType?.currency,
				firstname: user?.firstName,
				lastname: user?.lastName,
				email: user?.email,
				phone: `${user?.phonePrefix ?? ""}${user?.phoneNumber ?? ""}`,
				gender: user?.gender,
				pronouns: user?.pronouns,
				birthdate: dayMonthYear(user?.birthDate),
				nationality: user?.nationality,
				idNumber: application?.idNumber,
				idValidUntil: application?.validUntil,
				personalAddress: user?.personalAddress
					? `${user?.personalAddress?.street} ${user?.personalAddress?.houseNumber}
${user?.personalAddress?.zip} ${user?.personalAddress?.city}
${user?.personalAddress?.country}`
					: "",
				invoiceMethod: application?.invoiceMethod,
				invoiceAddress:
					application?.invoiceAddress &&
					`${invoicedTo}
${application?.invoiceAddress?.street} ${application?.invoiceAddress?.houseNumber}
${application?.invoiceAddress?.zip} ${application?.invoiceAddress?.city}
${application?.invoiceAddress?.country}`,
				allergies: application?.allergies,
				foodRestrictions: application?.foodRestriction,
				healthLimitations: application?.healthLimitations,
				additionalInformation: application?.additionalInformation,
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
