import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

import { NotificationType } from "@api/modules/push/enums";
import { User } from "@api/modules/users/entities";

/**
 * Notification type turned on/off by a user, a missing row means the type is on
 */
@Unique(["user", "type"])
@Entity()
export class NotificationPreference extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  user: User;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column()
  enabled: boolean;
}
