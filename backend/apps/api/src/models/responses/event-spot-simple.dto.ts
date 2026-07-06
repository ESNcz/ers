import { PickType } from "@nestjs/swagger";

import { EventSpot } from "@api/modules/events/entities";

export class EventSpotSimple extends PickType(EventSpot, ["id", "name", "price", "currency"]) {}
