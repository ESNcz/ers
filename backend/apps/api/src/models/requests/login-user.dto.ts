import { IsString, MinLength } from "class-validator";

export class LoginUser {
	/**
	 * User email or username
	 */
	@IsString()
	email: string;

	/**
	 * User password
	 */
	@IsString()
	@MinLength(6)
	password: string;
}
