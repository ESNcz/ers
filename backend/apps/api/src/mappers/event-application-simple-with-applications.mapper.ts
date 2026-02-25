import { Injectable } from "@nestjs/common";
import type {
	EventApplicationSimple,
	EventApplicationSimpleWithApplications,
	EventSimpleWithApplications,
} from "../models/responses";

// biome-ignore lint/style/useImportType: <explanation>
import { EventSimpleWithApplicationsMapper } from "./event-simple-with-applications.mapper";

@Injectable()
export class EventApplicationSimpleWithApplicationsMapper {
	constructor(private readonly eventSimpleWithApplicationsMapper: EventSimpleWithApplicationsMapper) {}

	map(application: EventApplicationSimple): EventApplicationSimpleWithApplications;
	map(application: EventApplicationSimple[]): EventApplicationSimpleWithApplications[];
	map(application: EventApplicationSimple | EventApplicationSimple[]) {
		if (Array.isArray(application)) return application.map(this.map.bind(this));

		const event = this.eventSimpleWithApplicationsMapper.map(
			application.event as never,
		) as unknown as EventSimpleWithApplications;

		return <EventApplicationSimpleWithApplications>(<unknown>{
			...application,
			event,
		});
	}
}
