import { Controller, Get, Query } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiQuery, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { Event, EventsService } from "./index";
import { Pagination, PaginationOptions } from "utilities/nest/decorators";
import { ParseDatePipe } from "utilities/nest/pipes";
import { PaginationDto, PaginationResponseDto } from "../../models/responses/pagination-response.dto";

@ApiTags("Events [Management]")
@Controller("management/events")
export class EventsManagementController {
	constructor(private readonly eventsService: EventsService) {}

	/**
	 * Find all events including not published/visible events
	 */
	@ApiQuery({ name: "sinceSince", required: false, type: Number })
	@ApiQuery({ name: "toSince", required: false, type: Number })
	@ApiExtraModels(Event, PaginationResponseDto<Event>)
	@ApiOkResponse({
		description: "Get all event for management",
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						data: {
							type: "array",
							items: { $ref: getSchemaPath(Event) },
						},
						pagination: { $ref: getSchemaPath(PaginationDto) },
					},
				},
			},
		},
	})
	@Get()
	getManagementEvents(
		@Query("sinceSince", ParseDatePipe) since?: Date,
		@Query("toSince", ParseDatePipe) to?: Date,
		@Pagination() pagination?: PaginationOptions,
	) {
		return this.eventsService.findByFilter({ to, since }, undefined, pagination);
	}
}
