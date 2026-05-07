import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MailModule } from "@api/modules/mail/mail.module";
import { PhotoModule } from "../photo";
import { Event, EventApplication, EventCustomOrganization, EventLink, EventSpot } from "./entities";
import { EventApplicationsService, EventSpotsService, EventsService } from "./providers/services";

@Module({
	imports: [
		TypeOrmModule.forFeature([Event, EventSpot, EventApplication, EventLink, EventCustomOrganization]),
		PhotoModule,
		MailModule,
	],
	providers: [EventsService, EventSpotsService, EventApplicationsService],
	exports: [EventsService, EventSpotsService, EventApplicationsService],
})
export class EventsModule {}
