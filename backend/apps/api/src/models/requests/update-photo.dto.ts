import { ApiProperty } from "@nestjs/swagger";
import { HasMimeType, IsFile, MaxFileSize, type MemoryStoredFile } from "nestjs-form-data";

/** Maximal upload size in bytes, keep in sync with frontend Dropzone `maxSize` */
const MAX_PHOTO_SIZE = 5 * 1024 ** 2;

export class UpdatePhoto {
  @ApiProperty({
    type: "string",
    format: "binary",
  })
  @IsFile()
  @MaxFileSize(MAX_PHOTO_SIZE, { message: "File is larger than 5MB" })
  @HasMimeType(["image/png", "image/jpeg", "image/webp"])
  file: MemoryStoredFile;
}
