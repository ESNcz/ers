import path from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";

import { FileStorageService } from "./providers/services";

// STORAGE_ROUTER_PREFIX
@Module({
	imports: [
		ConfigModule.forRoot(),
		ServeStaticModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				// const routerPrefix = configService.getOrThrow("STORAGE_ROUTER_PREFIX");
				// if (!path.isAbsolute(routerPrefix)) throw new Error("STORAGE_ROUTER_PREFIX must be absolute");
				// const storageRoot = configService.getOrThrow("STORAGE_ROOT");
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
