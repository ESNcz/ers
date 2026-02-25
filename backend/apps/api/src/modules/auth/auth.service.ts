import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { User, UsersService } from "@api/modules/users";
import { verifyPassword } from "@api/modules/auth/utilities/crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	/**
	 * Validate user email and password in database
	 * @param emailOrUsername User email
	 * @param password User password
	 * @returns {UserFindByEmailResult | null} Null if password does not match
	 */
	async validateUser(emailOrUsername: string, password: string): Promise<User | null> {
		const user = await this.usersService.findByUsernameOrEmailWithPassword(emailOrUsername);
		if (!user) return null;

		const result = await verifyPassword(password, user.password);
		return result ? user : null;
	}

	/**
	 * Create user jwt
	 * @param user User data
	 * @returns Token
	 */
	createToken(user: User) {
		return this.jwtService.signAsync({
			sub: user.id,
		});
	}

	// Create JWT reset password token
	async createResetPasswordToken(user: User): Promise<string> {
		return this.jwtService.signAsync(
			{ id: user.id, email: user.email },
			{
				expiresIn: "1h",
				issuer: this.configService.getOrThrow("WEB_DOMAIN"),
				subject: "reset-password",
			},
		);
	}

	// Verify reset password token
	async verifyResetPasswordToken(token: string) {
		return this.jwtService.verifyAsync(token, {
			issuer: this.configService.getOrThrow("WEB_DOMAIN"),
			subject: "reset-password",
		});
	}

	/**
	 * Create Token for e-mail verification of user
	 * @param user User data
	 * @returns Promise<string>
	 */
	async createEmailVerificationToken(user: User): Promise<string> {
		return this.jwtService.signAsync(
			{ id: user.id, email: user.email },
			{ expiresIn: "1d", issuer: this.configService.getOrThrow("WEB_DOMAIN"), subject: "verify" },
		);
	}

	/**
	 * Verify user token from e-mail
	 * @param token User e-mail token
	 * @returns Promise<any>
	 */
	async verifyVerificationToken(token: string) {
		return this.jwtService.verifyAsync(token, {
			issuer: this.configService.getOrThrow("WEB_DOMAIN"),
			subject: "verify",
		});
	}
}
