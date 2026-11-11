import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

import { NotificationType } from "@api/modules/push/enums";
import { User } from "@api/modules/users/entities";

/**
 * Scheduled notification already sent to a user, so a reminder goes out only once and survives API restarts
 */
@Unique(["user", "type", "entityId"])
@Entity()
export class NotificationLog extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  user: User;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  /** Id of the entity the notification is about, e.g. event id */
  @Column()
  entityId: string;

  @CreateDateColumn({ type: "timestamptz" })
  sentAt: Date;
}
