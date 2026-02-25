import { Photo } from "../../photo";
import { User } from "../../users";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EventApplication } from "./event-application.entity";
import { EventLink } from "./event-link.entity";
import { EventSpot } from "./event-spot.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Event extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column()
	title: string;

	@Column()
	@ApiProperty({
		description: "Short description in JSON format for RichText",
		example: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "left" },
					content: [{ type: "text", text: "Short description" }],
				},
			],
		},
	})
	shortDescription: string;

	// Select only short description by default
	@Column({ select: false })
	@ApiProperty({
		description: "Long description in JSON format for RichText",
		example: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "left" },
					content: [{ type: "text", text: "Very long description" }],
				},
			],
		},
	})
	longDescription: string;

	@Column()
	since: Date;

	@Column()
	until: Date;

	@ManyToOne(() => User, { nullable: false, eager: true, onDelete: "CASCADE" })
	createdByUser: User;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(() => Photo, { nullable: true, eager: true, onDelete: "SET NULL" })
	photo: Photo | null;

	@OneToMany(
		() => EventSpot,
		(spot) => spot.event,
		{ cascade: true },
	)
	spotTypes: EventSpot[];

	@OneToMany(
		() => EventApplication,
		(application) => application.event,
	)
	applications: EventApplication[];

	@OneToMany(
		() => EventLink,
		(link) => link.event,
	)
	links: EventLink[];

	@Column({ default: true })
	visible: boolean;

	@Column()
	registrationDeadline: Date;

	/**
	 * If true, generate invoices after {@link registrationDeadline}
	 */
	@Column({ default: true, select: false })
	generateInvoices: boolean;

	/**
	 * Additional registration form
	 * Each event can have different "requirements"
	 */
	@Column("json", { nullable: true, select: false })
	registrationForm: object | null;

	/**
	 * Event capacity
	 */
	@Column({ unsigned: true })
	capacity: number;

	/** Links */

	@Column()
	termsAndConditionsLink: string;

	@Column()
	photoPolicyLink: string;

	@Column()
	codeOfConductLink: string;

	constructor(event?: Partial<Event>) {
		super();

		Object.assign(this, event);
	}
}
