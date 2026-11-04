import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, ValidateNested } from "class-validator";

import { NotificationType } from "@api/modules/push/enums";

export class NotificationPreferenceItemDto {
  @ApiProperty({ enum: NotificationType, enumName: "NotificationType" })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}

/**
 * Types to change, types not listed keep their current state
 */
export class UpdateNotificationPreferencesDto {
  @ApiProperty({ type: NotificationPreferenceItemDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NotificationPreferenceItemDto)
  preferences: NotificationPreferenceItemDto[];
}
