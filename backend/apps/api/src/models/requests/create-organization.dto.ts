import { Type } from "class-transformer";
import { Allow, IsNotEmptyObject, IsObject, IsString } from "class-validator";
import { CreateAddress } from "./create-address.dto";

export class CreateOrganization {
	@Allow()
	@IsString()
	name: string;

	@IsString()
	legalName: string;

	@IsString()
	cin?: string | null | undefined;

	@IsString()
	vatin?: string | null | undefined;

	@IsNotEmptyObject()
	@IsObject()
	@Type(() => CreateAddress)
	address: CreateAddress;
}
