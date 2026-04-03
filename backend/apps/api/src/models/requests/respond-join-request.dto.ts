import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { JoinRequestStatus } from "@api/modules/organization/entities";

export class RespondJoinRequest {
	@ApiProperty({ enum: [JoinRequestStatus.Accepted, JoinRequestStatus.Rejected] })
	@IsEnum(JoinRequestStatus)
	status: JoinRequestStatus.Accepted | JoinRequestStatus.Rejected;
}
