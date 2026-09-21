import { ApiProperty } from "@nestjs/swagger";

import { EventApplicationDetailedWithApplications } from "./event-application-detailed-with-applications.dto";
import { EventSpotSimple } from "./event-spot-simple.dto";

/**
 * Everything the manage event applications page needs in one response
 */
export class EventApplicationsManagement {
  @ApiProperty({ type: () => [EventSpotSimple] })
  spots: EventSpotSimple[];

  @ApiProperty({ type: () => [EventApplicationDetailedWithApplications] })
  applications: EventApplicationDetailedWithApplications[];
}
