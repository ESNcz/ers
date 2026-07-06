import { PickType } from "@nestjs/swagger";

import { EventSpot } from "@api/modules/events/entities";

export class SpotTypeSimple extends PickType(EventSpot, ["id", "currency", "name", "price"]) {}
