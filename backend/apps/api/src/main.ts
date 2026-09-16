import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import packageJson from "base/package.json";
import { isDevelopment, isProduction } from "utilities/env";
import { includeSwagger } from "utilities/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  // Browser calls go through the web domain (Next.js rewrites `/api/*`), so only the web origin is allowed
  app.enableCors({
    origin: process.env.WEB_DOMAIN,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.enableShutdownHooks();

  if (isDevelopment || process.env.ENABLE_DOCS === "1") {
    const config = new DocumentBuilder()
      .setTitle(`${packageJson.name} API`)
      .setDescription(`The ${packageJson.name} API description`)
      .setVersion(packageJson.version)
      .addBearerAuth()
      .build();

    includeSwagger(app, config);
  }

  if (isProduction) {
    app.use(helmet());
  }

  // const configService = app.get(ConfigService);
  app.use(cookieParser());
  await app.listen(process.env.PORT_API ?? 4000);
}

bootstrap();
