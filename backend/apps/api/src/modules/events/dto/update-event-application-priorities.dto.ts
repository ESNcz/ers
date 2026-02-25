import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsPositive, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class EventApplicationPriorityDto {
	@ApiProperty()
	@IsInt()
	applicationId: number;

	@ApiProperty()
	@IsInt()
	@IsPositive()
	priority: number;
}

export class UpdateEventApplicationPrioritiesDto {
	@ApiProperty({ type: [EventApplicationPriorityDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => EventApplicationPriorityDto)
	priorities: EventApplicationPriorityDto[];
}
