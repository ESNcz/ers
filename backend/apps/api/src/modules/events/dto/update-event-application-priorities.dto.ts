import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsPositive, ValidateNested } from "class-validator";

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
