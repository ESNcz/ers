import { OmitType } from "@nestjs/swagger";

import { EventApplicationSimple } from "./event-application-simple.dto";
import type { EventSimpleWithApplications } from "./event-simple-with-applications.dto";

export class EventApplicationSimpleWithApplications extends OmitType(EventApplicationSimple, ["event"]) {
	event: EventSimpleWithApplications;
}
