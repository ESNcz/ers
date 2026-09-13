import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileStorageModule } from "@api/modules/file-storage";

import { Photo } from "./entities";
import { PhotoService } from "./providers/services";

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), FileStorageModule],
  providers: [PhotoService],
  exports: [PhotoService],
})
export class PhotoModule {}
