import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateSugarCubeDto {
	@ApiProperty({
		description: "Recipient user ID",
	})
  @IsString()
	@IsNotEmpty()
	toUserId: string;

	@ApiProperty({
		description: "Sugar cube message",
	})
	@IsString()
	@IsNotEmpty()
	message: string;

	@ApiProperty({
		description: "Whether the sender should be anonymous",
	})
	@IsBoolean()
	isAnonymous: boolean;
}
