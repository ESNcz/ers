import { ApiProperty } from "@nestjs/swagger";

export class SpotNotificationResponseDto {
	@ApiProperty({ example: 5, description: "Number of notification emails sent" })
	sent: number;
}
