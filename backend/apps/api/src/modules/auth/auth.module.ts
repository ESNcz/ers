import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";

import { CookieGuard, LocalGuard } from "./providers/guards";
import { AuthService } from "./providers/services";
import { CookieStrategy, LocalStrategy } from "./providers/strategies";

import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users";

@Module({
	imports: [
		PassportModule,
		ConfigModule,
		UsersModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.getOrThrow("JWT_SECRET"),
				signOptions: {
					issuer: configService.getOrThrow("WEB_DOMAIN"),
				},
			}),
		}),
	],
	providers: [AuthService, LocalStrategy, CookieStrategy, CookieGuard, LocalGuard],
	exports: [AuthService, CookieGuard],
})
export class AuthModule {}
