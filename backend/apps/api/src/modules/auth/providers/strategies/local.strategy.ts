import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { IStrategyOptions, Strategy } from "passport-local";

import { User } from "../../../users";
import { AuthService } from "../services";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super(<IStrategyOptions>{
			passwordField: "password",
			usernameField: "email",
		});
	}

	async validate(email: string, password: string): Promise<User> {
		const user = await this.authService.validateUser(email, password);

		if (!user) throw new UnauthorizedException("Invalid username/email or password");
		if (!user.isVerified) throw new NotFoundException("Your account e-mail address was not verified.");

		// Do not expose password hash by mistake
		user.password = undefined;
		return user;
	}
}
