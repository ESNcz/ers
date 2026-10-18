import {
  BaseEntity,
  Column,
  CreateDateColumn,
  type DeepPartial,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import type { FormAnswers } from "@api/modules/events/forms/form-fields";

import { EventApplication } from "./event-application.entity";
import { EventForm } from "./event-form.entity";

/**
 * Answers of one application to one additional form
 */
@Unique(["form", "application"])
@Entity()
export class EventFormResponse extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventForm, { nullable: false, onDelete: "CASCADE" })
  form: EventForm;

  @ManyToOne(() => EventApplication, { nullable: false, onDelete: "CASCADE" })
  application: EventApplication;

  /**
   * Keyed by field ID, may contain answers to fields removed from the form
   */
  @Column({ type: "json", default: {} })
  answers: FormAnswers;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  constructor(initial?: DeepPartial<EventFormResponse>) {
    super();
    Object.assign(this, initial);
  }
}
