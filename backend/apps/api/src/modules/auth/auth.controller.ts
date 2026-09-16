import { MailerService } from "@nestjs-modules/mailer";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { CurrentUser } from "@api/decorators";
import { LoginUser } from "@api/models/requests";
import { ResetPasswordDto } from "@api/models/requests/reset-password.dto";
import { User, UsersService } from "@api/modules/users";

import { AuthService } from "./index";
import { CookieGuard, LocalGuard } from "./providers/guards";
import { clearAuthCookie, setAuthCookie } from "./utilities/auth-cookie";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Try to login user with given email and password.
   * Token is only set as httpOnly cookie, never exposed in the response body.
   */
  @ApiNoContentResponse({ description: "User is logged-in, auth cookie is set" })
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("login")
  async loginUserWithEmailOrUsername(
    @Body() _data: LoginUser,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.createToken(user);
    setAuthCookie(response, token);
  }

  /**
   * Logout user on this device
   */
  @ApiOkResponse({ description: "User is no longer logged-in" })
  @Delete("logout")
  async logoutUser(@Res({ passthrough: true }) response: Response) {
    clearAuthCookie(response);
  }

  /**
   * Logout user on all devices by invalidating every issued token
   */
  @ApiOkResponse({ description: "All sessions of the user are invalidated" })
  @ApiBearerAuth()
  @UseGuards(CookieGuard)
  @Delete("logout-all")
  async logoutAllSessions(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response) {
    await this.usersService.incrementTokenVersion(user.id);
    clearAuthCookie(response);
  }

  @Delete("clear-auth")
  async removeCookie(@Res({ passthrough: true }) response: Response) {
    clearAuthCookie(response);
  }

  @Post("forgot-password")
  async forgotPassword(@Query("email") email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      // Do not reveal user existence
      return { message: "If this email is registered, a reset link has been sent." };
    }

    const resetToken = await this.authService.createResetPasswordToken(user);
    const resetUrl = `${this.configService.getOrThrow("WEB_DOMAIN")}/forgot-password/reset?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: [{ name: `${user.firstName} ${user.lastName}`, address: user.email }],
      from: { name: "No Reply", address: this.configService.getOrThrow<string>("MAIL_USER") },
      subject: "Password Reset Request",
      template: "reset-password", // create this template!
      context: {
        name: `${user.firstName} ${user.lastName}`,
        link: resetUrl,
      },
    });

    return { message: "If this email is registered, a reset link has been sent." };
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto) {
    let payload: {
      id: string;
      email: string;
      iat: number;
      exp: number;
      iss: string;
      sub: string;
    };
    try {
      payload = await this.authService.verifyResetPasswordToken(body.token);
    } catch (e) {
      throw new BadRequestException("Invalid or expired token");
    }
    const user = await this.usersService.findById(payload.id);
    if (!user) throw new BadRequestException("User not found");

    user.password = body.password;
    await this.usersService.save(user);
    // Password changed - sign out everywhere
    await this.usersService.incrementTokenVersion(user.id);

    return { message: "Password has been reset. You can now log in." };
  }

  @Get("verify")
  async verifyEmail(@Query("token") token: string) {
    try {
      const payload = await this.authService.verifyVerificationToken(token);
      const user = await this.usersService.findById(payload.id);
      if (!user) throw new BadRequestException("User not found");
      if (user.isVerified) return { message: "Already verified" };

      user.isVerified = true;
      await this.usersService.save(user);

      return { message: "Email verified successfully" };
    } catch (e) {
      throw new BadRequestException("Invalid or expired token");
    }
  }

  @Post("resend-verification")
  async resendVerification(@Query("email") email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new BadRequestException("User not found");
    if (user.isVerified) return { message: "Already verified" };

    const verificationToken = await this.authService.createEmailVerificationToken(user);
    const verifyUrl = `${this.configService.getOrThrow("WEB_DOMAIN")}/verify?token=${verificationToken}`;

    try {
      // TODO - Move to MailController (resend verification)
      await this.mailerService.sendMail({
        from: { name: "No Reply", address: this.configService.getOrThrow<string>("MAIL_USER") },
        to: [{ name: `${user.firstName} ${user.lastName}`, address: user.email }],
        subject: "Verify your email - resend",
        template: "verify-email",
        context: {
          name: `${user.firstName} ${user.lastName}`,
          link: verifyUrl,
        },
      });
    } catch (error) {
      console.error(error);
      return { message: "Unable to resend verification email" };
    }

    return { message: "Verification email resent" };
  }
}
