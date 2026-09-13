import { Type } from "class-transformer";
import { IsNotEmptyObject } from "class-validator";

import { CreateOrganization } from "./create-organization.dto";
import { CreateUser } from "./create-user.dto";

export class InitialiseType {
  @IsNotEmptyObject()
  @Type(() => CreateUser)
  user: CreateUser;

  @IsNotEmptyObject()
  @Type(() => CreateOrganization)
  organization: CreateOrganization;
}
