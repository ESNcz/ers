import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional } from "class-validator";

export class UpdateApplicationsSpotDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  applicationIds: number[];

  @ApiProperty({ type: Number, nullable: true })
  @IsInt()
  @IsOptional()
  spotId: number | null;
}
