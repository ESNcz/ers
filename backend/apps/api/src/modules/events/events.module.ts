import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PhotoModule } from "../photo";
import { Event, EventApplication, EventCustomOrganization, EventLink, EventSpot } from "./entities";
import { EventApplicationsService, EventSpotsService, EventsService } from "./providers/services";

@Module({
	imports: [
		TypeOrmModule.forFeature([Event, EventSpot, EventApplication, EventLink, EventCustomOrganization]),
		PhotoModule,
	],
	providers: [EventsService, EventSpotsService, EventApplicationsService],
	exports: [EventsService, EventSpotsService, EventApplicationsService],
})
export class EventsModule {}
