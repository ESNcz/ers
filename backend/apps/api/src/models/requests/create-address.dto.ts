import { IsString, Matches } from "class-validator";

export class CreateAddress {
	@IsString()
	city: string;

	@IsString()
	country: string;

	@IsString()
	street: string;

	/**
	 * House number with entrance support
	 */
	@IsString()
	@Matches(/^(\d+)(\/\d+)?$/)
	houseNumber: string;

	@IsString()
	zip: string;
}
