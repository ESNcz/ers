import { PartialType } from "@nestjs/swagger";

import type { UpdateEventLinkPartial } from "@api/models/requests/update-event-link.dto";

import { CreateEvent } from "./create-event.dto";

export class UpdateEvent extends PartialType(CreateEvent) {
  links: UpdateEventLinkPartial[];
}
