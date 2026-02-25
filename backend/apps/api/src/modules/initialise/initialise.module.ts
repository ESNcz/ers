import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, UsersModule } from "@api/modules/users";
import { Organization } from "@api/modules/organization";
import { OrganizationMember } from "@api/modules/organization/entities";
import { Role } from "@api/modules/roles";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@api/modules/auth";
import { MailModule } from "@api/modules/mail/mail.module";
import { InitialiseService } from "@api/modules/initialise/initialise.service";
import { InitialiseController } from "@api/modules/initialise/initialise.controller";
import { Address } from "@api/modules/addresses/entities";

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
