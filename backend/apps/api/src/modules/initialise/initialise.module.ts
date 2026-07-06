import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Address } from "@api/modules/addresses/entities";
import { AuthModule } from "@api/modules/auth";
import { InitialiseController } from "@api/modules/initialise/initialise.controller";
import { InitialiseService } from "@api/modules/initialise/initialise.service";
import { MailModule } from "@api/modules/mail/mail.module";
import { Organization } from "@api/modules/organization";
import { OrganizationMember } from "@api/modules/organization/entities";
import { Role } from "@api/modules/roles";
import { User, UsersModule } from "@api/modules/users";

@Module({
  imports: [
    UsersModule,
    MailModule,
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Organization, OrganizationMember, Address, Role]),
  ],
  controllers: [InitialiseController],
  providers: [InitialiseService],
  exports: [InitialiseService],
})
export class InitialiseModule {}
