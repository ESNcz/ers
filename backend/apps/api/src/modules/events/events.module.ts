import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PhotoModule } from "@api/modules/photo";

import {
  Event,
  EventApplication,
  EventCustomOrganization,
  EventForm,
  EventFormResponse,
  EventLink,
  EventSpot,
} from "./entities";
import { EventApplicationsService, EventFormsService, EventSpotsService, EventsService } from "./providers/services";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventSpot,
      EventApplication,
      EventLink,
      EventCustomOrganization,
      EventForm,
      EventFormResponse,
    ]),
    PhotoModule,
  ],
  providers: [EventsService, EventSpotsService, EventApplicationsService, EventFormsService],
  exports: [EventsService, EventSpotsService, EventApplicationsService, EventFormsService],
})
export class EventsModule {}
