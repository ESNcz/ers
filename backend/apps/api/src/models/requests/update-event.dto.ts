import { OmitType, PartialType } from "@nestjs/swagger";

import type { UpdateEventLinkPartial } from "@api/models/requests/update-event-link.dto";

import { CreateEvent } from "./create-event.dto";

export class UpdateEvent extends OmitType(PartialType(CreateEvent), ["registrationForm"]) {
  links: UpdateEventLinkPartial[];
}
