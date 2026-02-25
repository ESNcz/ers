import { PickType } from "@nestjs/swagger";

import { EventApplication } from "../../modules/events/entities";

import type { EventSimple } from "./event-simple.dto";
import type { SpotTypeSimple } from "./spot-type-simple.dto";

export class EventApplicationSimple extends PickType(EventApplication, ["createdAt", "id", "user", "priority"]) {
	event: EventSimple;
	spotType: SpotTypeSimple | null;
}
