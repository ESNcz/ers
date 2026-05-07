import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import sharp from "sharp";
import { FileStorageService } from "../file-storage";
import { Photo } from "./entities";
import { Repository } from "typeorm";

import crypto from "node:crypto";
import path from "node:path";

@Injectable()
export class PhotoService {
	private readonly logger = new Logger(PhotoService.name);

	constructor(
		@InjectRepository(Photo)
		private readonly photoRepository: Repository<Photo>,
		private readonly fileStorageService: FileStorageService,
	) {}

	async findById(id: string) {
		return this.photoRepository.findOneBy({ id });
	}

	/**
	 * Save photo. Resizes to fit 512x512 and converts to WebP.
	 * Falls back to the original buffer if processing fails (e.g. invalid image).
	 */
	async save(data: Buffer, directoryName: string): Promise<Photo | null> {
		let processed = data;
		try {
			processed = await sharp(data)
				.rotate()
				.resize(512, 512, { fit: "inside", withoutEnlargement: true })
				.webp({ quality: 80 })
				.toBuffer();
		} catch (error) {
			this.logger.warn(`Image optimization failed, storing original buffer: ${error instanceof Error ? error.message : error}`);
		}

		const fileName = crypto.randomUUID();
		const result = await this.fileStorageService.save(path.join(directoryName, fileName), processed);
		if (!result) return null;

		const photo = new Photo();
		photo.filename = result;

		return this.photoRepository.save(photo);
	}

	getPublicUrl(photo: Photo) {
		return this.fileStorageService.getPublicUrl(photo.filename);
	}

	/**
	 * Read photo data
	 * @param photo
	 * @returns
	 */
	read(photo: Photo) {
		return this.fileStorageService.read(photo.filename);
	}

	/**
	 * Delete photo file
	 * @param photo
	 */
	async delete(photo: Photo) {
		await this.fileStorageService
			.delete(photo.filename)
			.catch(() => null)
			.finally(async () => {
				await this.photoRepository.remove(photo);
			});
	}
}
