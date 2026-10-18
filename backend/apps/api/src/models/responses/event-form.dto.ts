import { ApiProperty } from "@nestjs/swagger";

import { FormFieldDefinition } from "@api/models/requests/event-form.dto";
import { EventFormStatus } from "@api/modules/events/forms/form-fields";

export class EventFormDetail {
  id: number;

  name: string;

  description: string | null;

  required: boolean;

  deadline: Date;

  position: number;

  @ApiProperty({ type: [FormFieldDefinition] })
  fields: FormFieldDefinition[];

  updatedAt: Date;
}

export class EventFormResponseCounts {
  complete: number;

  incomplete: number;

  /**
   * Applications without any response
   */
  missing: number;
}

export class EventFormManageItem extends EventFormDetail {
  @ApiProperty({ type: () => EventFormResponseCounts })
  counts: EventFormResponseCounts;
}

export class EventFormAnswerSet {
  /**
   * Answers to current fields keyed by field ID
   */
  @ApiProperty({ type: "object", additionalProperties: true })
  answers: Record<string, unknown>;

  updatedAt: Date;
}

/**
 * Form together with one application's answers
 */
export class ApplicantEventForm extends EventFormDetail {
  @ApiProperty({ type: () => EventFormAnswerSet, nullable: true })
  response: EventFormAnswerSet | null;

  @ApiProperty({ enum: EventFormStatus, enumName: "EventFormStatus" })
  status: EventFormStatus;

  /**
   * Deadline has passed, answers can't be changed
   */
  isClosed: boolean;
}

export class EventFormResponseRow {
  applicationId: number;

  firstName: string;

  lastName: string;

  email: string;

  /**
   * Organisation or custom organisation name
   */
  organization: string;

  spotName: string | null;

  @ApiProperty({ enum: EventFormStatus, enumName: "EventFormStatus" })
  status: EventFormStatus;

  updatedAt: Date | null;

  /**
   * Answers to current fields keyed by field ID
   */
  @ApiProperty({ type: "object", additionalProperties: true })
  answers: Record<string, unknown>;

  /**
   * Answers to fields removed from the form, keyed by the old field ID
   */
  @ApiProperty({ type: "object", additionalProperties: true })
  removedAnswers: Record<string, unknown>;
}

export class EventFormResponsesTable {
  @ApiProperty({ type: () => EventFormDetail })
  form: EventFormDetail;

  @ApiProperty({ type: [EventFormResponseRow] })
  rows: EventFormResponseRow[];
}
