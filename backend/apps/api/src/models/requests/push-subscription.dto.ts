import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsUrl, ValidateNested } from "class-validator";

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
