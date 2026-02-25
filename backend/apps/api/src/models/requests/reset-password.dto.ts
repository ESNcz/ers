import { IsString } from "class-validator";

export class ResetPasswordDto {
	/**
	 * User token
	 */
	@IsString()
	token: string;

	/**
	 * User password
	 */
	@IsString()
	password: string;
}
