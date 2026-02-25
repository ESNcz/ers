import { Module } from "@nestjs/common";
import { UsersModule } from "@api/modules/users";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@api/modules/auth";
import { MailModule } from "@api/modules/mail/mail.module";
import { Event, EventsModule } from "@api/modules/events";
import { EventApplication } from "@api/modules/events/entities";
import { SugarCubesService } from "@api/modules/sugar-cubes/sugar-cubes.service";
import { SugarCubesController } from "@api/modules/sugar-cubes/sugar-cubes.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SugarCube } from "./entities/sugar-cube.entity";
import { User } from "@api/modules/users/entities";

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
