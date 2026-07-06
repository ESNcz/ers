import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getDataSourceOptions } from "config/typeorm.config";
import { NestjsFormDataModule } from "nestjs-form-data";

import { HealthController } from "@api/controllers/health.controller";
import { AuthModule } from "@api/modules/auth";
import { AuthController } from "@api/modules/auth/auth.controller";
import { EventsModule } from "@api/modules/events";
import { EventApplicationsController } from "@api/modules/events/event-applications.controller";
import { EventSpotsController } from "@api/modules/events/event-spots.controller";
import { EventsManagementController } from "@api/modules/events/events-management.controller";
import { EventsController } from "@api/modules/events/events.controller";
import { FileStorageModule } from "@api/modules/file-storage";
import { InitialiseController } from "@api/modules/initialise/initialise.controller";
import { InitialiseModule } from "@api/modules/initialise/initialise.module";
import { MailModule } from "@api/modules/mail/mail.module";
import { OrganizationModule } from "@api/modules/organization";
import { OrganizationMembersController } from "@api/modules/organization/organization-members.controller";
import { OrganizationsController } from "@api/modules/organization/organizations.controller";
import { PhotoModule } from "@api/modules/photo";
import { PhotoController } from "@api/modules/photo/photo.controller";
import { RolesModule } from "@api/modules/roles";
import { RolesController } from "@api/modules/roles/roles.controller";
import { SettingsController } from "@api/modules/settings/settings.controller";
import { SettingsModule } from "@api/modules/settings/settings.module";
import { SugarCubesController } from "@api/modules/sugar-cubes/sugar-cubes.controller";
import { SugarCubesModule } from "@api/modules/sugar-cubes/sugar-cubes.module";
import { UsersModule } from "@api/modules/users";
import { UsersController } from "@api/modules/users/users.controller";

import { EventApplicationSimpleWithApplicationsMapper, EventSimpleWithApplicationsMapper } from "./mappers";

@Module({
  imports: [
    InitialiseModule,
    AuthModule,
    UsersModule,
    PhotoModule,
    OrganizationModule,
    EventsModule,
    NestjsFormDataModule.config({}),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const options = getDataSourceOptions();
        return {
          ...options,
          entities: undefined,
          autoLoadEntities: true,
          migrations: undefined,
        };
      },
    }),
    FileStorageModule,
    RolesModule,
    ConfigModule.forRoot(),
    MailModule,
    SettingsModule,
    SugarCubesModule,
  ],
  controllers: [
    InitialiseController,
    AuthController,
    UsersController,
    PhotoController,
    OrganizationsController,
    OrganizationMembersController,
    EventApplicationsController,
    EventsController,
    EventSpotsController,
    RolesController,
    EventsManagementController,
    HealthController,
    SettingsController,
    SugarCubesController,
  ],
  providers: [EventSimpleWithApplicationsMapper, EventApplicationSimpleWithApplicationsMapper],
})
export class AppModule {}
