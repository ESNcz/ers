import { OmitType } from "@nestjs/swagger";
import { OrganizationMember } from "../../modules/organization/entities";

export class OrganizationMemberWithoutOrganization extends OmitType(OrganizationMember, ["organization"]) {}
