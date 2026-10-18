import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";

import { CurrentUser } from "@api/decorators";
import { CreateEventForm, ReorderEventForms, SubmitEventFormResponse, UpdateEventForm } from "@api/models/requests";
import {
  ApplicantEventForm,
  EventFormDetail,
  EventFormManageItem,
  EventFormResponsesTable,
} from "@api/models/responses";
import { CookieGuard } from "@api/modules/auth/providers/guards";
import { Permission } from "@api/modules/roles";
import { User } from "@api/modules/users";

import { type ExportFormat, buildResponsesFile, exportFileName } from "./forms/form-export";
import { EventFormsService, EventsService } from "./index";

/**
 * Additional forms are managed by users who can create or update events, `hasOneOfPermissions` includes admins
 */
const canManageForms = (user: User) =>
  !!user.role?.hasOneOfPermissions([Permission.EventCreate, Permission.EventUpdate]);

@ApiTags("Event forms")
@Controller("events")
export class EventFormsController {
  constructor(
    private readonly eventFormsService: EventFormsService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Forms of the event with response counts.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: [EventFormManageItem] })
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event not found" })
  @UseGuards(CookieGuard)
  @Get(":eventId/forms/manage")
  async getEventFormsForManagement(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
  ): Promise<EventFormManageItem[]> {
    await this.assertManager(currentUser, eventId);
    return this.eventFormsService.getManageList(eventId);
  }

  /**
   * Create additional form. New forms are placed last.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: EventFormDetail })
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event not found" })
  @UseGuards(CookieGuard)
  @Post(":eventId/forms")
  async createEventForm(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Body() body: CreateEventForm,
  ): Promise<EventFormDetail> {
    await this.assertManager(currentUser, eventId);
    const form = await this.eventFormsService.create(eventId, body);
    return this.eventFormsService.toDetail(form);
  }

  /**
   * Set form order. Must be declared before `:formId` routes, otherwise `order` is parsed as form ID.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event not found" })
  @UseGuards(CookieGuard)
  @HttpCode(204)
  @Patch(":eventId/forms/order")
  async reorderEventForms(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Body() body: ReorderEventForms,
  ) {
    await this.assertManager(currentUser, eventId);
    await this.eventFormsService.reorder(eventId, body.formIds);
  }

  /**
   * Update additional form. Allowed after the deadline and with existing responses - answers are kept.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: EventFormDetail })
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event or form not found" })
  @UseGuards(CookieGuard)
  @Patch(":eventId/forms/:formId")
  async updateEventForm(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("formId", ParseIntPipe) formId: number,
    @Body() body: UpdateEventForm,
  ): Promise<EventFormDetail> {
    await this.assertManager(currentUser, eventId);
    const form = await this.eventFormsService.update(eventId, formId, body);
    return this.eventFormsService.toDetail(form);
  }

  /**
   * Delete additional form together with all its responses.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event or form not found" })
  @UseGuards(CookieGuard)
  @HttpCode(204)
  @Delete(":eventId/forms/:formId")
  async deleteEventForm(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("formId", ParseIntPipe) formId: number,
  ) {
    await this.assertManager(currentUser, eventId);
    await this.eventFormsService.remove(eventId, formId);
  }

  /**
   * One row per event application with its answers to the form.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: EventFormResponsesTable })
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event or form not found" })
  @UseGuards(CookieGuard)
  @Get(":eventId/forms/:formId/responses")
  async getEventFormResponses(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("formId", ParseIntPipe) formId: number,
  ): Promise<EventFormResponsesTable> {
    await this.assertManager(currentUser, eventId);
    return this.eventFormsService.getResponsesTable(eventId, formId);
  }

  /**
   * Export form responses as XLSX (default) or CSV.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiQuery({ name: "format", enum: ["xlsx", "csv"], enumName: "EventFormExportFormat", required: false })
  @ApiOkResponse({ description: "XLSX or CSV file", schema: { type: "string", format: "binary" } })
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event or form not found" })
  @UseGuards(CookieGuard)
  @Get(":eventId/forms/:formId/export")
  async exportEventFormResponses(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("formId", ParseIntPipe) formId: number,
    @Res() res: Response,
    @Query("format") format?: string,
  ) {
    await this.assertManager(currentUser, eventId);
    if (format !== undefined && format !== "csv" && format !== "xlsx") {
      throw new BadRequestException("format must be xlsx or csv");
    }
    const exportFormat: ExportFormat = format === "csv" ? "csv" : "xlsx";

    const table = await this.eventFormsService.getResponsesTable(eventId, formId);
    const buffer = await buildResponsesFile(table, exportFormat);

    res.setHeader("Content-Disposition", `attachment; filename="${exportFileName(table.form.name, exportFormat)}"`);
    res
      .type(
        exportFormat === "csv"
          ? "text/csv; charset=utf-8"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
      .send(buffer);
  }

  /**
   * All forms of the event with answers of one application.
   *
   * Permissions required: `event.create` or `event.update`
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ApplicantEventForm] })
  @ApiForbiddenResponse({ description: "Missing `event.create` or `event.update` permission" })
  @ApiNotFoundResponse({ description: "Event or application not found" })
  @UseGuards(CookieGuard)
  @Get(":eventId/applications/:applicationId/forms")
  async getApplicationEventForms(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("applicationId", ParseIntPipe) applicationId: number,
  ): Promise<ApplicantEventForm[]> {
    await this.assertManager(currentUser, eventId);
    const application = await this.eventFormsService.findApplicationOfEvent(eventId, applicationId);
    return this.eventFormsService.getApplicantForms(eventId, application.id);
  }

  /**
   * Forms of the event with the signed-in applicant's answers.
   *
   * Only applicants of the event can access it.
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ApplicantEventForm] })
  @ApiForbiddenResponse({ description: "User has no application for this event" })
  @ApiNotFoundResponse({ description: "Event not found" })
  @UseGuards(CookieGuard)
  @Get(":eventId/forms")
  async getMyEventForms(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
  ): Promise<ApplicantEventForm[]> {
    const application = await this.getOwnApplication(currentUser, eventId);
    return this.eventFormsService.getApplicantForms(eventId, application.id);
  }

  /**
   * Create or replace the signed-in applicant's answers. Possible until the form deadline.
   */
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApplicantEventForm })
  @ApiBadRequestResponse({ description: "Invalid answers, `fieldErrors` maps field IDs to messages" })
  @ApiForbiddenResponse({ description: "User has no application for this event or the deadline has passed" })
  @ApiNotFoundResponse({ description: "Event or form not found" })
  @UseGuards(CookieGuard)
  @Put(":eventId/forms/:formId/response")
  async submitEventFormResponse(
    @CurrentUser() currentUser: User,
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("formId", ParseIntPipe) formId: number,
    @Body() body: SubmitEventFormResponse,
  ): Promise<ApplicantEventForm> {
    const application = await this.getOwnApplication(currentUser, eventId);
    const form = await this.eventFormsService.findOneOfEvent(eventId, formId);
    const response = await this.eventFormsService.submit(form, application.id, body.answers);
    return this.eventFormsService.toApplicantForm(form, response);
  }

  private async assertManager(user: User, eventId: number) {
    if (!canManageForms(user)) throw new ForbiddenException("You don't have permission to perform this action");
    if (!(await this.eventsService.existsById(eventId))) throw new NotFoundException("Event not found");
  }

  private async getOwnApplication(user: User, eventId: number) {
    if (!(await this.eventsService.existsById(eventId))) throw new NotFoundException("Event not found");
    const application = await this.eventFormsService.findApplicationOfUser(eventId, user.id);
    if (!application) throw new ForbiddenException("Only applicants of this event can fill its forms");
    return application;
  }
}
