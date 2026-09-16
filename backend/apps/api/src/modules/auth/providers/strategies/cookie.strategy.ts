import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtContent } from "@api/modules/auth/types";
import { AUTH_COOKIE } from "@api/modules/auth/utilities/auth-cookie";
import { User, UsersService } from "@api/modules/users";

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
        (request: Request) => request.cookies?.[AUTH_COOKIE],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      issuer: configService.getOrThrow("WEB_DOMAIN"),
    });
  }

  async validate(tokenData: JwtContent): Promise<User> {
    const [user, tokenVersion] = await Promise.all([
      this.usersService.findById(tokenData.sub),
      this.usersService.getTokenVersion(tokenData.sub),
    ]);
    if (!user) throw new UnauthorizedException();
    // Tokens issued before versioning have no `ver` and are treated as version 0
    if ((tokenData.ver ?? 0) !== tokenVersion) throw new UnauthorizedException();

    return user;
  }
}
