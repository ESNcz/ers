import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsService } from "@api/modules/settings/settings.service";
import { Settings } from "@api/modules/settings/entities/settings.entity";
import { SettingsController } from "@api/modules/settings/settings.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Settings])],
	providers: [SettingsService],
	controllers: [SettingsController],
	exports: [SettingsService],
})
export class SettingsModule {}
