import { PartialType } from "@nestjs/swagger";
import { CreateEventSpot } from "./create-event-spot.dto";

export class UpdateEventSpot extends PartialType(CreateEventSpot) {}
