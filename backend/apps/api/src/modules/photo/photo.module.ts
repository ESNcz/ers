import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Photo } from "./entities";
import { PhotoService } from "./providers/services";

import { FileStorageModule } from "../file-storage";

@Module({
	imports: [TypeOrmModule.forFeature([Photo]), FileStorageModule],
	providers: [PhotoService],
	exports: [PhotoService],
})
export class PhotoModule {}
