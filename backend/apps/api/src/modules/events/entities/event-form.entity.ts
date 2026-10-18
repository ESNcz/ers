import {
  BaseEntity,
  Column,
  CreateDateColumn,
  type DeepPartial,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import type { FormField } from "@api/modules/events/forms/form-fields";

import { Event } from "./event.entity";

/**
 * Additional form filled by event applicants after registering
 */
@Entity()
export class EventForm extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, { nullable: false, onDelete: "CASCADE" })
  event: Event;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  /**
   * Visual flag only - nothing is blocked when a required form is not filled
   */
  @Column({ default: false })
  required: boolean;

  /**
   * Applicants can submit and edit answers until this moment
   */
  @Column({ type: "timestamptz" })
  deadline: Date;

  /**
   * Display order within the event, `order` is a reserved SQL word
   */
  @Column({ type: "int", default: 0 })
  position: number;

  @Column({ type: "json" })
  fields: FormField[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  constructor(initial?: DeepPartial<EventForm>) {
    super();
    Object.assign(this, initial);
  }
}
