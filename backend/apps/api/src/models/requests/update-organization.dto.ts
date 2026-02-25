import { PartialType } from "@nestjs/swagger";
import { CreateOrganization } from "./create-organization.dto";

export class UpdateOrganization extends PartialType(CreateOrganization) {}
