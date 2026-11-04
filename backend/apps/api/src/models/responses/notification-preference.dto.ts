import { ApiProperty } from "@nestjs/swagger";

import { NotificationType } from "@api/modules/push/enums";

export class NotificationPreferenceDto {
  @ApiProperty({ enum: NotificationType, enumName: "NotificationType" })
  type: NotificationType;

  @ApiProperty()
  enabled: boolean;
}
