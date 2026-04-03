import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileStorageService } from "../file-storage";
import { Photo } from "./entities";
import { Repository } from "typeorm";
import sharp from "sharp";

import crypto from "node:crypto";
import path from "node:path";

const MAX_DIMENSION = 800;

@Injectable()
export class PhotoService {
	constructor(
		@InjectRepository(Photo)
		private readonly photoRepository: Repository<Photo>,
		private readonly fileStorageService: FileStorageService,
	) {}

	async findById(id: string) {
		return this.photoRepository.findOneBy({ id });
	}

	/**
	 * Save photo — downsample and convert to .webp
	 * @param data Photo data
	 * @param directoryName Target directory name
	 * @returns
	 */
	async save(data: Buffer, directoryName: string): Promise<Photo | null> {
		const processed = await sharp(data)
			.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
			.webp({ quality: 80 })
			.toBuffer();

		const fileName = `${crypto.randomUUID()}.webp`;
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
