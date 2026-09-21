import { ApiProperty } from "@nestjs/swagger";

import { EventDetail } from "./event-detail.dto";

/**
 * Everything the event detail page needs for the signed-in user in one response
 */
export class EventDetailView {
  @ApiProperty({ type: () => EventDetail })
  event: EventDetail;

  /**
   * ID of the signed-in user's application, `null` when not registered
   */
  userApplicationId: number | null;

  /**
   * Signed-in user is admin or manages at least one organization
   */
  isManager: boolean;
}
