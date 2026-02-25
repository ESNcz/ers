import { IsNumber, IsOptional } from "class-validator";

export class UpdateApplicationSlotDto {
	@IsNumber()
	@IsOptional()
	spotId: number | null;
}
