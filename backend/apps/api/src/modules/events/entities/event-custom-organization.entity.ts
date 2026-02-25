import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EventApplication } from "./event-application.entity";

@Entity()
export class EventCustomOrganization {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(
		() => EventApplication,
		(application) => application.customOrganization,
		{ nullable: false, onDelete: "CASCADE" },
	)
	@JoinColumn()
	application: EventApplication;

	@Column()
	name: string;

	@Column()
	country: string;

	@CreateDateColumn()
	createdAt: Date;

	constructor(base?: Partial<EventCustomOrganization>) {
		Object.assign(this, base);
	}
}
