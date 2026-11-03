import { ApiProperty } from "@nestjs/swagger";

/**
 * User who can receive push notifications - has at least one subscribed device
 */
export class PushRecipientDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ description: "Number of subscribed devices" })
  devices: number;
}

export class PushSendResultDto {
  @ApiProperty({ description: "Users the notification was sent to" })
  recipients: number;

  @ApiProperty({ description: "Devices accepted by the push service" })
  delivered: number;

  @ApiProperty({ description: "Devices that failed, expired subscriptions are removed" })
  failed: number;
}
