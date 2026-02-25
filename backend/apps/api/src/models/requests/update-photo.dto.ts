import { ApiProperty } from "@nestjs/swagger";
import { HasMimeType, IsFile, type MemoryStoredFile } from "nestjs-form-data";

export class UpdatePhoto {
	@ApiProperty({
		type: "string",
		format: "binary",
	})
	@IsFile()
	@HasMimeType(["image/png", "image/jpeg"])
	file: MemoryStoredFile;
}
