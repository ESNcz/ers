import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import crypto from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { Repository } from "typeorm";

import { FileStorageService } from "@api/modules/file-storage";

import { Photo } from "./entities";

/** Maximal photo dimensions (width and height) in pixels */
export const PhotoMaxDimension = {
  UserPhoto: 512,
  EventPhoto: 1920,
} as const;

/** Widths supported for resizing on request, limits CPU usage and number of cached variants */
export const PhotoWidths = [64, 128, 256, 512, 960, 1280, 1920] as const;

const WEBP_QUALITY = 80;

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
   * Convert image to WebP, downscaled to fit within `maxDimension` x `maxDimension`
   * @param data Image data
   * @param maxDimension Maximal width and height in pixels
   * @returns WebP image data
   */
  static async toWebp(data: Buffer, maxDimension: number): Promise<Buffer> {
    return sharp(data)
      .rotate() // Apply EXIF orientation, metadata is stripped on output
      .resize(maxDimension, maxDimension, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  }

  /**
   * Round width up to the nearest supported width
   * @param width Requested width in pixels
   * @returns Supported width in pixels
   */
  static snapWidth(width: number): number {
    return PhotoWidths.find((supportedWidth) => supportedWidth >= width) ?? PhotoWidths[PhotoWidths.length - 1];
  }

  /**
   * Resize photo to given width as WebP
   * @param data Photo data
   * @param width Target width in pixels
   * @returns Resized WebP image data, or null if the photo is not wider than `width`
   */
  async resize(data: Buffer, width: number): Promise<Buffer | null> {
    const metadata = await sharp(data).metadata();
    const originalWidth = metadata.autoOrient?.width ?? metadata.width;
    if (!originalWidth || originalWidth <= width) return null;

    return sharp(data)
      .rotate() // Apply EXIF orientation, metadata is stripped on output
      .resize({ width })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  }

  /**
   * Save photo as WebP
   * @param data Photo data
   * @param directoryName Target directory name
   * @param maxDimension Maximal width and height in pixels
   * @returns
   */
  async save(data: Buffer, directoryName: string, maxDimension: number): Promise<Photo | null> {
    const webp = await PhotoService.toWebp(data, maxDimension).catch(() => {
      throw new BadRequestException("Invalid image");
    });

    const fileName = `${crypto.randomUUID()}.webp`;
    const result = await this.fileStorageService.save(path.join(directoryName, fileName), webp);
    if (!result) return null;

    const photo = new Photo();
    photo.filename = result;

    return this.photoRepository.save(photo);
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
