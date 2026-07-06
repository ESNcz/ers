import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RolesModule } from "@api/modules/roles";

import { Organization, OrganizationMember } from "./entities";
import { OrganizationService } from "./providers/services";

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationMember]), RolesModule],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
