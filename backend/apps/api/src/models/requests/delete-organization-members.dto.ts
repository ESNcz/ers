import { IsInt } from "class-validator";

export class DeleteOrganizationMembers {
	@IsInt({ each: true })
	memberIds: number[];
}
