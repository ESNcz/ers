import { EventLink } from "@api/modules/events/entities";
import { OmitType } from "@nestjs/swagger";

export class UpdateEventLinkPartial extends OmitType(EventLink, ["id", "event"]) {
	id: number | null;
}
