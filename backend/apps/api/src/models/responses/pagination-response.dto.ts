import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto {
	@ApiProperty({ example: 1, description: "Current page number" })
	currentPage: number;

	@ApiProperty({ example: 10, description: "Number of items per page" })
	perPage: number;

	@ApiProperty({ example: 5, description: "Total number of pages" })
	maxPages: number;
}

export class PaginationResponseDto<T> {
	@ApiProperty({
		description: "Array of requested data",
		isArray: true,
		type: Object,
	})
	data: T[];

	@ApiProperty({ description: "Pagination metadata", type: PaginationDto })
	pagination: PaginationDto;
}
