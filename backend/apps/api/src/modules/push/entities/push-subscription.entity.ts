import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "@api/modules/users/entities";

/**
 * Web Push subscription of one browser / installed app, a user can have many
 */
@Entity()
export class PushSubscription extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  /** Push service URL, unique per browser subscription */
  @Index({ unique: true })
  @Column()
  endpoint: string;

  @Column()
  p256dh: string;

  @Column()
  auth: string;

  @Column({ type: "varchar", nullable: true })
  userAgent: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
