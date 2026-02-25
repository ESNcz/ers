import { Address } from "@api/modules/addresses/entities";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  type DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Organization } from "../../organization";
import { User } from "../../users";
import { InvoiceMethods } from "../invoice-methods";
import { EventCustomOrganization } from "./event-custom-organization.entity";
import { EventSpot } from "./event-spot.entity";
import { Event } from "./event.entity";

/**
 * Event application represents registration to event
 *
 * Important things before save or update:
 * - Organization or customOrganization must be set
 *
 */
@Unique(["user", "event"])
@Entity()
export class EventApplication extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@ManyToOne(
		() => Event,
		(event) => event.applications,
		{
			nullable: false,
			onDelete: "CASCADE",
		},
	)
	event: Event;

	@ManyToOne(() => Organization, { nullable: true })
	organization: Organization;

	@OneToOne(
		() => EventCustomOrganization,
		(organization) => organization.application,
		{ cascade: true, nullable: true, orphanedRowAction: "delete" },
	)
	customOrganization: EventCustomOrganization | null;

	/**
	 * Spot, must be one of {@link event} spots
	 */
	@ManyToOne(() => EventSpot, {
		nullable: true,
		onDelete: "SET NULL",
		eager: true,
	})
	spotType: EventSpot | null;

	@Column({ type: "json", default: {}, select: false })
	additionalData: object;

	@OneToOne(() => Address, { cascade: true })
	@JoinColumn()
	personalAddress: Address;

	@Column({ type: "enum", enum: InvoiceMethods, default: InvoiceMethods.personal, enumName: "InvoiceMethods" })
	invoiceMethod: InvoiceMethods;

	@Column({ nullable: true })
	invoicedTo: string | null;

	@OneToOne(() => Address, { cascade: true })
	@JoinColumn()
	invoiceAddress: Address;

	@Column({ nullable: true })
	additionalInformation: string;

	@Column({ default: "" })
	allergies: string;

	@Column({ default: "" })
	foodRestriction: string;

	@Column({ default: "" })
	healthLimitations: string;

	@Column({ nullable: true })
	validUntil: Date;

	@Column({ select: true })
	idNumber: string;

	@Column({ type: "int", nullable: true })
	priority: number | null;

	@CreateDateColumn()
	createdAt: Date;

	constructor(initial?: DeepPartial<EventApplication>) {
		super();
		Object.assign(this, initial);
	}
}
