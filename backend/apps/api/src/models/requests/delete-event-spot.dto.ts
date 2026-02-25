import { IsOptional } from "class-validator";

export class DeleteEventSpot {
	/**
	 * In case of valid value it replaces assigned users with new spot otherwise unset their spot
	 */
	@IsOptional()
	replaceWithSpotId?: number;
}
