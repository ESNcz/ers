import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  StreamableFile,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";

import { PhotoService, PhotoWidths } from "./index";

@ApiTags("Photo")
@Controller("photo")
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @ApiHeader({ name: "origin", required: false })
  @ApiOkResponse({ description: "Image data" })
  @ApiNotFoundResponse({ description: "Image not found" })
  @ApiBadRequestResponse({ description: "Invalid width" })
  @ApiQuery({
    name: "w",
    required: false,
    type: Number,
    description: `Requested width in pixels, rounded up to the nearest supported width (${PhotoWidths.join(", ")}). Without it, the original image is returned.`,
  })
  @Get(":id")
  async getPhoto(
    @Param("id", ParseUUIDPipe) photoId: string,
    @Query("w", new ParseIntPipe({ optional: true })) width: number | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (width !== undefined && width < 1) throw new BadRequestException("Width must be a positive number");

    const photo = await this.photoService.findById(photoId);
    if (!photo) throw new NotFoundException();

    const stream = await this.photoService.read(photo).catch(() => {
      throw new NotFoundException();
    });

    const host = request.get("host");
    if (host) res.setHeader("Access-Control-Allow-Origin", host);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // Photo content never changes for given ID, new upload always creates new photo
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    // Uploads are stored as WebP, original can be streamed directly
    if (width === undefined && photo.filename.endsWith(".webp")) {
      return new StreamableFile(stream, { type: "image/webp" });
    }

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Resized on every request, variants are not stored to save storage
    if (width !== undefined) {
      const resized = await this.photoService.resize(buffer, PhotoService.snapWidth(width));
      if (resized) return new StreamableFile(resized, { type: "image/webp" });
    }

    // Original image (legacy photo not yet converted, or requested width is not smaller than original)
    const fileType = await fileTypeFromBuffer(buffer);

    return new StreamableFile(buffer, { type: fileType?.mime });
  }
}
