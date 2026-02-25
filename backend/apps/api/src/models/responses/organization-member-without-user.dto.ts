import { OmitType } from "@nestjs/swagger";
import { OrganizationMember } from "@api/modules/organization/entities";

export class OrganizationMemberWithoutUser extends OmitType(OrganizationMember, ["user"]) {}
