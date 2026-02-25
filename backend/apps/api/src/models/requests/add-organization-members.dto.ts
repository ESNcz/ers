import { Allow, IsString } from "class-validator";

export class AddOrganizationMembers {
	@Allow()
	@IsString({ each: true })
	userIds: string[];
}
