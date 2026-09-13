import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "@api/modules/auth";
import { Event, EventsModule } from "@api/modules/events";
import { EventApplication } from "@api/modules/events/entities";
import { MailModule } from "@api/modules/mail/mail.module";
import { SugarCubesController } from "@api/modules/sugar-cubes/sugar-cubes.controller";
import { SugarCubesService } from "@api/modules/sugar-cubes/sugar-cubes.service";
import { UsersModule } from "@api/modules/users";
import { User } from "@api/modules/users/entities";

import { SugarCube } from "./entities/sugar-cube.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([SugarCube, User, Event, EventApplication]),
    UsersModule,
    EventsModule,
    MailModule,
    AuthModule,
    ConfigModule,
  ],
  controllers: [SugarCubesController],
  providers: [SugarCubesService],
  exports: [SugarCubesService],
})
export class SugarCubesModule {}
