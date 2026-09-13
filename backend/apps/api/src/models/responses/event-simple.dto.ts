import { PickType } from "@nestjs/swagger";

import { Event } from "@api/modules/events";

export class EventSimple extends PickType(Event, [
  "id",
  "photo",
  "since",
  "until",
  "title",
  "createdByUser",
  "shortDescription",
  "registrationDeadline",
  "priorityListDeadline",
  "visible",
  "termsAndConditionsLink",
  "photoPolicyLink",
  "codeOfConductLink",
  "capacity",
]) {}
