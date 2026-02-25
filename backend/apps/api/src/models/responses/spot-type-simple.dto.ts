import { PickType } from "@nestjs/swagger";
import { EventSpot } from "../../modules/events/entities";

export class SpotTypeSimple extends PickType(EventSpot, ["id", "currency", "name", "price"]) {}
