import { ApiProperty } from "@nestjs/swagger";
import { User } from "@api/modules/users/entities";

export class SugarCubeRecipientOptionDto {
    @ApiProperty({
        type: "object",
        additionalProperties: {
            type: "array",
            items: { $ref: "#/components/schemas/User" }
        }
    })
    grouped: Record<string, User[]>;
}
