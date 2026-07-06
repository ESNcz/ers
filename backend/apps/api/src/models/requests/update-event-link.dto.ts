import { OmitType } from "@nestjs/swagger";

import { EventLink } from "@api/modules/events/entities";

export class UpdateEventLinkPartial extends OmitType(EventLink, ["id", "event"]) {
  id: number | null;
}
