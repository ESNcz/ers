import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { InitialiseType } from "@api/models/requests";
import { InitialiseService } from "@api/modules/initialise/initialise.service";
import type { Response } from "express";
import { isProduction } from "utilities/env";

const INIT_COOKIE = "InitFlag";
const COOKIE_MAX_AGE_SECONDS = 1 * 24 * 60 * 60 * 1_000; // 1 days in milliseconds

@ApiTags("Initialise")
@Controller("initialise")
export class InitialiseController {
	constructor(private readonly initialiseService: InitialiseService) {}

	@ApiCreatedResponse({ description: "Is application initialised" })
	@Get()
	async getInitialised(@Res({ passthrough: true }) response: Response) {
		const result = await this.initialiseService.checkInitialisation();

		response
			.cookie(INIT_COOKIE, result.isInitialised ? "1" : "0", {
				domain: isProduction ? process.env.WEB_DOMAIN.split("https://")[1] : "localhost",
				httpOnly: true,
				secure: true,
				sameSite: "none",
				maxAge: COOKIE_MAX_AGE_SECONDS,
				path: "/",
			})
			.status(200)
			.send({ isInitialised: result.isInitialised });
	}

	@ApiCreatedResponse({ type: InitialiseType, description: "Initialisation created successfully" })
	@Post()
	async createInitialState(@Body() body: InitialiseType, @Res({ passthrough: true }) response: Response) {
		const init = await this.initialiseService.initialiseSystem(body);
		response
			.cookie(INIT_COOKIE, init.user ? "1" : "0", {
				domain: isProduction ? process.env.WEB_DOMAIN.split("https://")[1] : "localhost",
				httpOnly: true,
				secure: true,
				sameSite: "none",
				maxAge: COOKIE_MAX_AGE_SECONDS,
				path: "/",
			})
			.status(200)
			.send({ init });
	}
}
