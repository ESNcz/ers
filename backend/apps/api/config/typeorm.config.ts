import path from "node:path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, type DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { isProduction } from "utilities/env";

export const getDataSourceOptions = () => {
	ConfigModule.forRoot({ isGlobal: true });

	const configService = new ConfigService();
	const migrationFiles = isProduction ? ".{ts,js}" : ".ts";

	return <DataSourceOptions>{
		type: "postgres",
		host: configService.getOrThrow("DB_HOST"),
		port: +configService.get("DB_PORT") || 5432,
		database: configService.getOrThrow("DB_NAME"),
		username: configService.get("DB_USER"),
		password: configService.get("DB_PASS"),
		namingStrategy: new SnakeNamingStrategy(),
		entities: [`../**/*.entity${migrationFiles}`],
		migrations: [path.join(process.cwd(), "database", "migrations", `*${migrationFiles}`)],
	};
};

const getDataSource = () => new DataSource(getDataSourceOptions());

export default getDataSource();
