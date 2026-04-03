import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization, OrganizationMember, OrganizationJoinRequest } from "./entities";
import { RolesModule } from "../roles";
import { OrganizationService } from "./providers/services";

@Module({
	imports: [TypeOrmModule.forFeature([Organization, OrganizationMember, OrganizationJoinRequest]), RolesModule],
	providers: [OrganizationService],
	exports: [OrganizationService],
})
export class OrganizationModule {}
