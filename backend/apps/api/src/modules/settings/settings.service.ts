import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Settings } from "@api/modules/settings/entities/settings.entity";
import { SettingsDTO } from "@api/modules/settings/dto/update-settings.dto";

@Injectable()
export class SettingsService {
	constructor(
		@InjectRepository(Settings)
		private readonly SettingsRepository: Repository<Settings>,
	) {}

	async getOrCreateSettings() {
		let info = (await this.SettingsRepository.find())[0];
		if (!info) {
			info = this.SettingsRepository.create({});
			info = await this.SettingsRepository.save(info);
		}
		return info;
	}

	async updateSettings(dto: SettingsDTO) {
		const info = await this.getOrCreateSettings();
		Object.assign(info, dto);
		return this.SettingsRepository.save(info);
	}
}
