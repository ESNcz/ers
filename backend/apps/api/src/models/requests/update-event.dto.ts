import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateEvent } from "./create-event.dto";
import type { UpdateEventLinkPartial } from "@api/models/requests/update-event-link.dto";

export class UpdateEvent extends OmitType(PartialType(CreateEvent), ["registrationForm"]) {
	links: UpdateEventLinkPartial[];
}
