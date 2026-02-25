import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Event } from "./event.entity";
import { CurrencyEnum } from "../enums/currency.enum";

/**
 * TODO: multiple-currencies?
 */
@Entity()
export class EventSpot {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ unsigned: true })
	price: number;

	@ManyToOne(
		() => Event,
		(event) => event.spotTypes,
		{
			nullable: true,
			onDelete: "CASCADE",
		},
	)
	event: Event;

	@Column({ type: "enum", enum: CurrencyEnum, default: CurrencyEnum.CZK })
	currency: CurrencyEnum;

	constructor(base?: Partial<EventSpot>) {
		Object.assign(this, base);
	}
}
