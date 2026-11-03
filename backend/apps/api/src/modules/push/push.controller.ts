import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "@api/decorators";
import { CreatePushSubscriptionDto, DeletePushSubscriptionDto, SendPushDto } from "@api/models/requests";
import { PushPublicKeyDto, PushRecipientDto, PushSendResultDto } from "@api/models/responses";
import { CookieGuard } from "@api/modules/auth/providers/guards";
import { User } from "@api/modules/users/entities";

import { PushService } from "./push.service";

@ApiTags("Push Notifications")
@Controller("push")
@UseGuards(CookieGuard)
@ApiBearerAuth()
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @ApiOkResponse({ type: PushPublicKeyDto })
  @Get("public-key")
  getPushPublicKey(): PushPublicKeyDto {
    return { publicKey: this.pushService.getPublicKey() };
  }

  /**
   * Save the browser push subscription of the current user
   */
  @ApiNoContentResponse({ description: "Subscription saved" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("subscribe")
  async subscribePush(
    @CurrentUser() user: User,
    @Body() dto: CreatePushSubscriptionDto,
    @Headers("user-agent") userAgent?: string,
  ) {
    await this.pushService.subscribe(user, dto, userAgent ?? null);
  }

  @ApiNoContentResponse({ description: "Subscription removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("unsubscribe")
  async unsubscribePush(@CurrentUser() user: User, @Body() dto: DeletePushSubscriptionDto) {
    await this.pushService.unsubscribe(user, dto.endpoint);
  }

  /**
   * Send a test notification to all devices of the current user
   */
  @ApiNoContentResponse({ description: "Test notification sent" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("test")
  async sendTestPush(@CurrentUser() user: User) {
    await this.pushService.sendToUser(user.id, {
      title: "Notifications are on",
      body: "This is how notifications from ERS will look.",
      url: "/account",
      tag: "push-test",
    });
  }

  /**
   * Users who can receive a notification from `POST /push/send`, admin only
   */
  @ApiOkResponse({ type: PushRecipientDto, isArray: true })
  @Get("recipients")
  async getPushRecipients(@CurrentUser() user: User) {
    if (!user.role?.isAdmin()) {
      throw new ForbiddenException("You don't have permission to send notifications");
    }
    return await this.pushService.getRecipients();
  }

  /**
   * Send a custom notification to the chosen recipients or all of them, admin only
   */
  @ApiOkResponse({ type: PushSendResultDto })
  @HttpCode(HttpStatus.OK)
  @Post("send")
  async sendPush(@CurrentUser() user: User, @Body() dto: SendPushDto) {
    if (!user.role?.isAdmin()) {
      throw new ForbiddenException("You don't have permission to send notifications");
    }
    return await this.pushService.sendCustom(user, dto);
  }
}
