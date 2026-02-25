import { PartialType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateAddress } from "./create-address.dto";
import { CreateUser } from "./create-user.dto";
import { Allow, IsOptional, ValidateNested } from "class-validator";

export class UpdateUser extends PartialType(
	PickType(CreateUser, ["password", "firstName", "lastName", "username", "gender", "phonePrefix", "phoneNumber"]),
) {
	@Allow()
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateAddress)
	personalAddress?: CreateAddress | null;

	@Allow()
	@IsOptional()
	pronouns?: string | null;
}
