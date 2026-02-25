import { Logger } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { SwaggerModule, type OpenAPIObject } from "@nestjs/swagger";
import type { Response, Express } from "express";

const getTemplate = (openApi: Omit<OpenAPIObject, "paths">, path: string) => `
<!DOCTYPE html>
<html>
  <head>
    <title>${openApi.info.title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements@8.5.2/styles.min.css">
    <script src="https://unpkg.com/@stoplight/elements@8.5.2/web-components.min.js"></script>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      elements-api {
        display: block;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <elements-api
      apiDescriptionUrl="${path}"
      router="hash"
      layout="sidebar"
      tryItCredentialsPolicy="include"
    />
  </body>
</html>
`;

export const includeSwagger = (
	app: INestApplication<Express>,
	openApi: Omit<OpenAPIObject, "paths">,
	path = "/docs",
) => {
	const absolutePath = path.startsWith("/") ? path : `/${path}`;

	const document = SwaggerModule.createDocument(app, openApi, {
		operationIdFactory: (_, methodKey: string) => {
			// Convert "getUsers" to "Get Users"
			const methodName = methodKey
				.replace(/([A-Z])/g, " $1")
				// Capitalize first letter
				.replace(/^./, (str) => str.toUpperCase());

			return methodName.trim();
		},
	});

	const jsonAbsolutePath = `${absolutePath}-json`;
	const template = getTemplate(openApi, jsonAbsolutePath);

	app.use(jsonAbsolutePath, (_, res) => {
		res.json(document);
	});
	// Serve custom documentation page
	app.use(absolutePath, (_, res: Response) => res.send(template));

	// biome-ignore lint/suspicious/noExplicitAny: NestJS does not expose direct httpServer access. This is for informative, can be deleted
	const httpServer = (app as any).httpServer as Express;
	httpServer.on("listening", () => {
		// biome-ignore lint/suspicious/noExplicitAny: Express does not expose direct `address` method
		const test = httpServer as any;
		const { port } = test.address();
		Logger.log(`Listening docs on: http://localhost:${port}${absolutePath}`, "Swagger");
	});
};
