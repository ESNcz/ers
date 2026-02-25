import { IsOptional, IsString } from "class-validator";

export class SettingsDTO {
	@IsString()
	@IsOptional()
	termsAndConditions: string | null;

	@IsString()
	@IsOptional()
	privacyPolicy: string | null;

	@IsString()
	@IsOptional()
	footerDescription: string | null;
}
