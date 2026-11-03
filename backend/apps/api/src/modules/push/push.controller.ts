import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "@api/decorators";
import { CreatePushSubscriptionDto, DeletePushSubscriptionDto } from "@api/models/requests";
import { PushPublicKeyDto } from "@api/models/responses";
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
}
