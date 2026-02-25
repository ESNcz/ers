import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization, OrganizationMember } from "./entities";
import { RolesModule } from "../roles";
import { OrganizationService } from "./providers/services";

@Module({
	imports: [TypeOrmModule.forFeature([Organization, OrganizationMember]), RolesModule],
	providers: [OrganizationService],
	exports: [OrganizationService],
})
export class OrganizationModule {}
