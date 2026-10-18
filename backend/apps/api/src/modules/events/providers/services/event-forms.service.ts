import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { In, QueryFailedError, Repository } from "typeorm";

import type { CreateEventForm, UpdateEventForm } from "@api/models/requests";
import type {
  ApplicantEventForm,
  EventFormDetail,
  EventFormManageItem,
  EventFormResponseRow,
  EventFormResponsesTable,
} from "@api/models/responses";
import { EventApplication, EventForm, EventFormResponse } from "@api/modules/events/entities";
import {
  EventFormStatus,
  type FormAnswers,
  type FormField,
  computeStatus,
  mergeAnswers,
  normalizeFormFields,
  splitAnswers,
  validateAnswers,
  validateFormFields,
} from "@api/modules/events/forms/form-fields";

const UNIQUE_VIOLATION = "23505";

@Injectable()
export class EventFormsService {
  constructor(
    @InjectRepository(EventForm)
    private readonly formRepository: Repository<EventForm>,
    @InjectRepository(EventFormResponse)
    private readonly responseRepository: Repository<EventFormResponse>,
    @InjectRepository(EventApplication)
    private readonly applicationRepository: Repository<EventApplication>,
  ) {}

  findByEventId(eventId: number) {
    return this.formRepository.find({
      where: { event: { id: eventId } },
      order: { position: "ASC", id: "ASC" },
    });
  }

  async findOneOfEvent(eventId: number, formId: number) {
    const form = await this.formRepository.findOne({ where: { id: formId, event: { id: eventId } } });
    if (!form) throw new NotFoundException("Form not found");
    return form;
  }

  async create(eventId: number, body: CreateEventForm) {
    const fields = this.assertValidFields(body.fields);
    const position = await this.formRepository.count({ where: { event: { id: eventId } } });

    return this.formRepository.save(
      new EventForm({
        event: { id: eventId },
        name: body.name,
        description: body.description?.trim() || null,
        required: body.required,
        deadline: body.deadline,
        fields,
        position,
      }),
    );
  }

  /**
   * Allowed any time - existing answers are kept, see `mergeAnswers`
   */
  async update(eventId: number, formId: number, body: UpdateEventForm) {
    const form = await this.findOneOfEvent(eventId, formId);

    if (body.name !== undefined) form.name = body.name;
    if (body.description !== undefined) form.description = body.description?.trim() || null;
    if (body.required !== undefined) form.required = body.required;
    if (body.deadline !== undefined) form.deadline = body.deadline;
    if (body.fields !== undefined) form.fields = this.assertValidFields(body.fields);

    return this.formRepository.save(form);
  }

  /**
   * Copies forms of one event to another, used when duplicating events. Responses are not copied.
   */
  async copyToEvent(sourceEventId: number, targetEventId: number) {
    const forms = await this.findByEventId(sourceEventId);
    if (forms.length === 0) return;

    await this.formRepository.save(
      forms.map(
        (form) =>
          new EventForm({
            event: { id: targetEventId },
            name: form.name,
            description: form.description,
            required: form.required,
            deadline: form.deadline,
            position: form.position,
            fields: form.fields.map((field) => ({ ...field, id: randomUUID() })),
          }),
      ),
    );
  }

  async remove(eventId: number, formId: number) {
    const form = await this.findOneOfEvent(eventId, formId);
    await this.formRepository.remove(form);
  }

  async reorder(eventId: number, formIds: number[]) {
    const forms = await this.findByEventId(eventId);
    const expected = forms.map((form) => form.id).sort((a, b) => a - b);
    const given = [...formIds].sort((a, b) => a - b);
    if (expected.length !== given.length || expected.some((id, index) => id !== given[index])) {
      throw new BadRequestException("formIds must list every form of the event exactly once");
    }

    await this.formRepository.manager.transaction(async (manager) => {
      for (const [index, id] of formIds.entries()) {
        await manager.update(EventForm, { id }, { position: index });
      }
    });
  }

  findApplicationOfUser(eventId: number, userId: string) {
    return this.applicationRepository.findOne({ where: { event: { id: eventId }, user: { id: userId } } });
  }

  async findApplicationOfEvent(eventId: number, applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, event: { id: eventId } },
    });
    if (!application) throw new NotFoundException("Application not found");
    return application;
  }

  async submit(form: EventForm, applicationId: number, answers: FormAnswers) {
    if (new Date() > form.deadline) throw new ForbiddenException("The deadline of this form has passed");

    const fieldErrors = validateAnswers(form.fields, answers);
    if (Object.keys(fieldErrors).length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        error: "Bad Request",
        message: Object.values(fieldErrors),
        fieldErrors,
      });
    }

    const existing = await this.responseRepository.findOne({
      where: { form: { id: form.id }, application: { id: applicationId } },
    });
    const response = existing ?? new EventFormResponse({ form: { id: form.id }, application: { id: applicationId } });
    response.answers = mergeAnswers(form.fields, existing?.answers ?? {}, answers);

    try {
      return await this.responseRepository.save(response);
    } catch (error) {
      // Two first submissions at once - unique (form, application) rejects the second
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException("The form was just saved from another place, reload and try again");
      }
      throw error;
    }
  }

  /**
   * Answers to the given forms keyed by application ID, then form ID
   */
  async findAnswersByApplication(formIds: number[]) {
    const answersByApplication = new Map<number, Map<number, FormAnswers>>();
    if (formIds.length === 0) return answersByApplication;

    const responses = await this.responseRepository.find({
      where: { form: { id: In(formIds) } },
      relations: { form: true, application: true },
    });
    for (const response of responses) {
      const answersByForm = answersByApplication.get(response.application.id) ?? new Map<number, FormAnswers>();
      answersByForm.set(response.form.id, response.answers);
      answersByApplication.set(response.application.id, answersByForm);
    }
    return answersByApplication;
  }

  async getApplicantForms(eventId: number, applicationId: number): Promise<ApplicantEventForm[]> {
    const forms = await this.findByEventId(eventId);
    if (forms.length === 0) return [];

    const responses = await this.responseRepository.find({
      where: { form: { id: In(forms.map((form) => form.id)) }, application: { id: applicationId } },
      relations: { form: true },
    });
    const responseByForm = new Map(responses.map((response) => [response.form.id, response]));

    return forms.map((form) => this.toApplicantForm(form, responseByForm.get(form.id) ?? null));
  }

  async getManageList(eventId: number): Promise<EventFormManageItem[]> {
    const [forms, applicationCount] = await Promise.all([
      this.findByEventId(eventId),
      this.applicationRepository.count({ where: { event: { id: eventId } } }),
    ]);
    if (forms.length === 0) return [];

    const responses = await this.responseRepository.find({
      where: { form: { id: In(forms.map((form) => form.id)) } },
      relations: { form: true },
    });

    return forms.map((form) => {
      const formResponses = responses.filter((response) => response.form.id === form.id);
      const complete = formResponses.filter(
        (response) => computeStatus(form.fields, response.answers) === EventFormStatus.complete,
      ).length;

      return {
        ...this.toDetail(form),
        counts: {
          complete,
          incomplete: formResponses.length - complete,
          missing: applicationCount - formResponses.length,
        },
      };
    });
  }

  async getResponsesTable(eventId: number, formId: number): Promise<EventFormResponsesTable> {
    const form = await this.findOneOfEvent(eventId, formId);
    const [applications, responses] = await Promise.all([
      this.applicationRepository.find({
        where: { event: { id: eventId } },
        relations: { user: true, organization: true, customOrganization: true },
        order: { createdAt: "ASC" },
      }),
      this.responseRepository.find({ where: { form: { id: form.id } }, relations: { application: true } }),
    ]);
    const responseByApplication = new Map(responses.map((response) => [response.application.id, response]));

    const rows = applications.map((application): EventFormResponseRow => {
      const response = responseByApplication.get(application.id) ?? null;
      const { current, removed } = splitAnswers(form.fields, response?.answers ?? {});

      return {
        applicationId: application.id,
        firstName: application.user.firstName,
        lastName: application.user.lastName,
        email: application.user.email,
        organization: application.organization?.name ?? application.customOrganization?.name ?? "",
        spotName: application.spotType?.name ?? null,
        status: computeStatus(form.fields, response?.answers ?? null),
        updatedAt: response?.updatedAt ?? null,
        answers: current,
        removedAnswers: removed,
      };
    });

    return { form: this.toDetail(form), rows };
  }

  toDetail(form: EventForm): EventFormDetail {
    return {
      id: form.id,
      name: form.name,
      description: form.description,
      required: form.required,
      deadline: form.deadline,
      position: form.position,
      fields: form.fields,
      updatedAt: form.updatedAt,
    };
  }

  /**
   * Answers to removed fields are hidden - applicants only see current fields
   */
  toApplicantForm(form: EventForm, response: EventFormResponse | null): ApplicantEventForm {
    return {
      ...this.toDetail(form),
      response: response
        ? { answers: splitAnswers(form.fields, response.answers).current, updatedAt: response.updatedAt }
        : null,
      status: computeStatus(form.fields, response?.answers ?? null),
      isClosed: new Date() > form.deadline,
    };
  }

  private assertValidFields(fields: FormField[]) {
    const normalized = normalizeFormFields(fields);
    const errors = validateFormFields(normalized);
    if (errors.length > 0) throw new BadRequestException(errors);
    return normalized;
  }
}
