import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

@Entity()
export class EventLink {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	link: string;

	@ManyToOne(
		() => Event,
		(event) => event.links,
		{ onDelete: "CASCADE" },
	)
	event: Event;

	constructor(init?: Partial<EventLink>) {
		Object.assign(this, init);
	}
}
