import { Injectable } from "@nestjs/common";

import type { EventSimpleWithApplications } from "@api/models/responses";
import type { Event } from "@api/modules/events";

@Injectable()
export class EventSimpleWithApplicationsMapper {
  map(event: Event[]): EventSimpleWithApplications[];
  map(event: Event): EventSimpleWithApplications;
  map(event: Event | Event[]) {
    if (Array.isArray(event)) return event.map(this.map.bind(this));

    return <EventSimpleWithApplications>{
      ...event,
      applications: event.applications?.length,
    };
  }
}
