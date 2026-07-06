import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { CurrencyEnum } from "@api/modules/events/enums/currency.enum";

import { Event } from "./event.entity";

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

  @ManyToOne(() => Event, (event) => event.spotTypes, {
    nullable: true,
    onDelete: "CASCADE",
  })
  event: Event;

  @Column({ type: "enum", enum: CurrencyEnum, default: CurrencyEnum.CZK })
  currency: CurrencyEnum;

  constructor(base?: Partial<EventSpot>) {
    Object.assign(this, base);
  }
}
