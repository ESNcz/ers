import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class PushSubscriptionKeysDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  auth: string;
}

/**
 * Same shape as `PushSubscription.toJSON()` in the browser
 */
export class CreatePushSubscriptionDto {
  @ApiProperty({ description: "Push service endpoint" })
  @IsUrl({ protocols: ["https"], require_tld: false })
  endpoint: string;

  @ApiProperty({ type: PushSubscriptionKeysDto })
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;
}

export class DeletePushSubscriptionDto {
  @ApiProperty({ description: "Push service endpoint" })
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}

/**
 * Notification sent by an admin from the Settings page
 */
export class SendPushDto {
  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
    description: "Recipients, all available recipients when empty or missing",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  userIds?: string[];

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ required: false, maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  body?: string;

  @ApiProperty({ required: false, description: "App path opened on click, e.g. `/account`" })
  @IsOptional()
  // App paths only - no links to other sites
  @Matches(/^\/(?![/\\])/, { message: "url must be an app path starting with /" })
  url?: string;
}
