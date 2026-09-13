import { IsOptional, IsString } from "class-validator";

import type { Permission } from "@api/modules/roles";

export class CreateRole {
  @IsString()
  name: string;

  @IsOptional()
  permissions?: Permission[] = [];
}
