import { ConfigModule } from "@nestjs/config";

ConfigModule.forRoot();

const { NODE_ENV } = process.env;

export const storagePath = "storage";
export const isProduction = NODE_ENV === "production";
export const isDevelopment = NODE_ENV === "development" || NODE_ENV === undefined;
