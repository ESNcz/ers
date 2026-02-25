import { IsEmail, IsEnum, IsObject, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { UserGender } from "../../modules/users/enums";
import { CreateAddress } from "./create-address.dto";
import { Transform, Type } from "class-transformer";
import { DateTransform, IsValidDate } from "utilities/nest/class-validator";

export class CreateUser {
	/**
	 * User email
	 */
	@IsEmail()
	email: string;

	/**
	 * User password
	 */
	@MinLength(6)
	@IsString()
	password: string;

	/**
	 * First name
	 */
	@IsString()
	firstName: string;

	/**
	 * Last name
	 */
	@IsString()
	lastName: string;

	/**
	 * Must not contain special characters
	 */
	@IsString()
	@Matches(/^[a-zA-Z0-9_-]+$/)
	@MinLength(6)
	username: string;

	/**
	 * User birthdate
	 * @example 2024-12-20T16:48:34.681Z
	 */
	@IsValidDate()
	@Transform(DateTransform)
	birthDate: Date;

	/**
	 * User nationality
	 */
	@IsString()
	nationality: string;

	/**
	 * User phone number prefix
	 */
	@IsString()
	phonePrefix: string;

	/**
	 * User phone number
	 */
	@IsString()
	phoneNumber: string;

	/**
	 * User gender
	 */
	@IsEnum(UserGender)
	gender: UserGender = UserGender.PreferNotToSay;

	@IsObject()
	@IsOptional()
	@Type(() => CreateAddress)
	personalAddress?: CreateAddress | undefined | null;
}
