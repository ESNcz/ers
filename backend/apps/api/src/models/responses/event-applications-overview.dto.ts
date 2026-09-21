import { ApiProperty } from "@nestjs/swagger";

import { EventApplicationDetailedWithApplications } from "./event-application-detailed-with-applications.dto";
import { EventDetail } from "./event-detail.dto";
import { OrganizationMemberWithoutUser } from "./organization-member-without-user.dto";

/**
 * Everything the event applications page needs for the signed-in manager in one response
 */
export class EventApplicationsOverview {
  @ApiProperty({ type: () => EventDetail })
  event: EventDetail;

  /**
   * Applications visible to the signed-in user
   */
  @ApiProperty({ type: () => [EventApplicationDetailedWithApplications] })
  applications: EventApplicationDetailedWithApplications[];

  /**
   * Organization memberships of the signed-in user
   */
  @ApiProperty({ type: () => [OrganizationMemberWithoutUser] })
  userOrganisationMemberships: OrganizationMemberWithoutUser[];
}
