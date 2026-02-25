import fs from "node:fs/promises";
import path from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createReadStream, existsSync, ReadStream } from "node:fs";
import { storagePath } from "utilities/env";

@Injectable()
export class FileStorageService {
	private readonly logger = new Logger(FileStorageService.name);
	// Storage base path for docker volumes
	private readonly BasePath: string;
	private readonly BaseUrl: string;

	constructor(private readonly configService: ConfigService) {
		this.BasePath = storagePath;
		this.BaseUrl = `${this.configService.getOrThrow("API_DOMAIN")}/${storagePath}`;

		this.BasePath = path.isAbsolute(this.BasePath) ? this.BasePath : path.join(process.cwd(), this.BasePath);
		fs.mkdir(this.BasePath, { recursive: true });

		this.logger.log(`Storage is located at: ${this.BasePath} and mapped to ${storagePath}`);
	}

	/**
	 * Constructs the absolute file path based on the base storage path.
	 * @param filePath - Relative file path
	 * @returns Full file path resolved against the base path
	 */
	private getFilePath(filePath: string) {
		return path.join(this.BasePath, filePath);
	}

	/**
	 * Saves a file to the specified path.
	 * @param filePath - Destination path where the file will be stored
	 * @param buffer - Data to save (Buffer or string)
	 * @returns Promise resolving to a boolean indicating success or failure
	 */
	async save(filePath: string, buffer: Buffer | string): Promise<string | null> {
		const fullFilePath = this.getFilePath(filePath);
		const dirname = path.dirname(fullFilePath);
		await fs.mkdir(dirname, { recursive: true });

		return fs
			.writeFile(fullFilePath, buffer)
			.then(() => filePath)
			.catch(() => null);
	}

	/**
	 * Read file to read stream
	 * @param filePath File path
	 * @returns ReadStream
	 */
	async read(filePath: string): Promise<ReadStream> {
		const exist = await this.exist(filePath);
		if (!exist) throw new Error(`File ${filePath} does not exist`);

		const fullFilePath = this.getFilePath(filePath);
		return createReadStream(fullFilePath);
	}

	/**
	 * Deletes a file or directory at the specified path.
	 * @param filePath - Path to the file or directory to delete
	 * @returns Promise that resolves when the operation is complete
	 */
	async delete(filePath: string) {
		await fs.rm(this.getFilePath(filePath), { force: true, recursive: true });
	}

	/**
	 * Check if file exist
	 * @param filePath File path
	 * @returns True, if file exist
	 */
	async exist(filePath: string) {
		return existsSync(this.getFilePath(filePath));
	}

	/**
	 * Gets the full file path resolved against the base storage path.
	 * @param filePath - Relative file path
	 * @returns Promise that resolves to the absolute path
	 */
	async getFullPath(filePath: string) {
		return this.getFilePath(filePath);
	}

	getPublicUrl(filePath: string) {
		return `${this.BaseUrl}/${filePath}`;
	}
}
