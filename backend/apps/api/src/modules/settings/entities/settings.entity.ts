import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("settings")
export class Settings extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text", nullable: true })
	termsAndConditions?: string;

	@Column({ type: "text", nullable: true })
	privacyPolicy?: string;

	@Column({ type: "text", nullable: true })
	footerDescription?: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
