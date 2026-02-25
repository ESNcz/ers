import { Column, type DeepPartial, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Address {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	city: string;

	@Column()
	country: string;

	@Column()
	zip: string;

	@Column()
	street: string;

	/**
	 * House number with entrance number
	 *
	 * @example 1234/5
	 */
	@Column()
	houseNumber: string;

	constructor(data: DeepPartial<Address>) {
		this.update(data);
	}

	/**
	 * Make copy of current entity
	 * @returns
	 */
	copy() {
		return new Address({ ...this, id: undefined });
	}

	update(data: DeepPartial<Address>) {
		Object.assign(this, data);
	}
}
