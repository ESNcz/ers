import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Req, Res, StreamableFile } from "@nestjs/common";
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";

import { PhotoService } from "./index";

@ApiTags("Photo")
@Controller("photo")
export class PhotoController {
	constructor(private readonly photoService: PhotoService) {}

	@ApiHeader({ name: "origin", required: false })
	@ApiOkResponse({ description: "Image data" })
	@ApiNotFoundResponse({ description: "Image not found" })
	@Get(":id")
	async getPhoto(
		@Param("id", ParseUUIDPipe) photoId: string,
		@Req() request: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const photo = await this.photoService.findById(photoId);
		if (!photo) throw new NotFoundException();

		const stream = await this.photoService.read(photo).catch(() => {
			throw new NotFoundException();
		});

		// To provide mime type, whole stream must be read (TODO: Save mime type in the future or convert all images to same type)
		const chunks = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);

		const host = request.get("host");
		const { mime } = await fileTypeFromBuffer(buffer);
		res.setHeader("Access-Control-Allow-Origin", host);
		res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

		return new StreamableFile(buffer, { type: mime });
	}
}
