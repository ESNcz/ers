import { PartialType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Allow, IsOptional, ValidateNested } from "class-validator";

import { CreateAddress } from "./create-address.dto";
import { CreateUser } from "./create-user.dto";

export class UpdateUser extends PartialType(
  PickType(CreateUser, [
    "firstName",
    "lastName",
    "username",
    "password",
    "gender",
    "phonePrefix",
    "phoneNumber",
    "birthDate",
    "nationality",
  ]),
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
