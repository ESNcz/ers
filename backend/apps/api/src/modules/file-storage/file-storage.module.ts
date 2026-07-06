import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import path from "node:path";

import { FileStorageService } from "./providers/services";

// STORAGE_ROUTER_PREFIX
@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        return [
          {
            rootPath: path.join(process.cwd(), "storage"),
            serveRoot: "/storage/",
          },
        ];
      },
    }),
  ],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
