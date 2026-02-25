import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { JwtContent } from "../../types";
import { User, UsersService } from "../../../users";

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly usersService: UsersService,
		readonly configService: ConfigService,
	) {
		super({
			secretOrKey: configService.getOrThrow("JWT_SECRET"),
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => request.cookies?.AuthCookie,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			issuer: configService.getOrThrow("WEB_DOMAIN"),
		});
	}

	async validate(tokenData: JwtContent): Promise<User> {
		const user = await this.usersService.findById(tokenData.sub);
		if (!user) throw new UnauthorizedException();

		return user;
	}
}
