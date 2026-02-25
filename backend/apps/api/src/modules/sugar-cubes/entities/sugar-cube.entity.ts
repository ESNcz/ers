import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event, EventApplication } from "@api/modules/events/entities";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class SugarCube extends BaseEntity {
	@PrimaryGeneratedColumn("increment")
	@ApiProperty()
	id: number;

	@Column()
	@ApiProperty({
		description: "Message",
	})
	message: string;

	@Column({ default: false })
	@ApiProperty({
		description: "Whether the sender is anonymous",
	})
	isAnonymous: boolean;

	@Column({ default: false })
	@ApiProperty({
		description: "Whether the sugar cube has been reported",
	})
	isReported: boolean;

	@ManyToOne(() => EventApplication, { nullable: false })
	@ApiProperty({ type: () => EventApplication })
	fromUser: EventApplication;

	@ManyToOne(() => EventApplication, { nullable: false })
	@ApiProperty({ type: () => EventApplication })
	toUser: EventApplication;

	@ManyToOne(
		() => Event,
		(event) => event,
		{ nullable: false }
	)
	@ApiProperty({ type: () => Event })
	event: Event;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

	constructor(event?: Partial<Event>) {
		super();

		Object.assign(this, event);
	}
}
