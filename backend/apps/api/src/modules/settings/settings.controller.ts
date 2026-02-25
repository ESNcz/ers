// src/app-info/app-info.controller.ts
import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { SettingsService } from "@api/modules/settings/settings.service";
import { SettingsDTO } from "@api/modules/settings/dto/update-settings.dto";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { CookieGuard } from "@api/modules/auth/providers/guards";
import { Settings } from "@api/modules/settings/entities/settings.entity";

@Controller("settings")
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	/**
	 * Get all the global setting of the app
	 */
	@ApiOkResponse({ type: Settings, description: "Returns settings" })
	@Get()
	async getSettings() {
		return this.settingsService.getOrCreateSettings();
	}

	/**
	 * Update the global setting of the app
	 */
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@ApiOkResponse({ type: Settings, description: "Returns settings" })
	@Put()
	async updateSettings(@Body() dto: SettingsDTO) {
		return this.settingsService.updateSettings(dto);
	}
}
