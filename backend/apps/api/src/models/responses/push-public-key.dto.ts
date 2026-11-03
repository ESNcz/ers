import { ApiProperty } from "@nestjs/swagger";

export class PushPublicKeyDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: "VAPID public key for `pushManager.subscribe`, `null` when push is not configured on the server",
  })
  publicKey: string | null;
}
