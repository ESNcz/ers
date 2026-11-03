import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import webPush, { WebPushError } from "web-push";

import { CreatePushSubscriptionDto, SendPushDto } from "@api/models/requests";
import { PushRecipientDto, PushSendResultDto } from "@api/models/responses";
import { User } from "@api/modules/users/entities";

import { PushSubscription } from "./entities/push-subscription.entity";

/**
 * Data read by `public/sw.js` on the frontend
 */
export interface PushPayload {
  title: string;
  body?: string;
  /** App path opened on notification click */
  url?: string;
  /** Notifications with the same tag replace each other instead of stacking */
  tag?: string;
}

/** Push services drop undelivered messages after this time - 1 day */
const TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly publicKey: string | null;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly pushSubscriptionsRepository: Repository<PushSubscription>,
    configService: ConfigService,
  ) {
    const publicKey = configService.get<string>("VAPID_PUBLIC_KEY");
    const privateKey = configService.get<string>("VAPID_PRIVATE_KEY");
    const subject = configService.get<string>("VAPID_SUBJECT");

    if (publicKey && privateKey && subject) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
      this.publicKey = publicKey;
    } else {
      this.publicKey = null;
      this.logger.warn("VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY or VAPID_SUBJECT missing - push notifications disabled");
    }
  }

  get isEnabled() {
    return this.publicKey !== null;
  }

  getPublicKey() {
    return this.publicKey;
  }

  /**
   * Save a browser subscription, an endpoint already saved for another user is moved to the current one
   */
  async subscribe(user: User, dto: CreatePushSubscriptionDto, userAgent: string | null) {
    await this.pushSubscriptionsRepository.upsert(
      {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent,
        user: { id: user.id },
      },
      ["endpoint"],
    );
  }

  async unsubscribe(user: User, endpoint: string) {
    await this.pushSubscriptionsRepository.delete({ endpoint, user: { id: user.id } });
  }

  async sendToUser(userId: string, payload: PushPayload) {
    return await this.sendToUsers([userId], payload);
  }

  /**
   * Send to every subscription of the users. Never throws - a failed push must not fail the action that triggered it
   * TODO: add `type: NotificationType` and skip users who turned the type off (see backend/TODO.md - Notifications)
   * @returns Number of devices delivered and failed
   */
  async sendToUsers(userIds: string[], payload: PushPayload) {
    const result = { delivered: 0, failed: 0 };
    if (!this.isEnabled || userIds.length === 0) return result;

    try {
      const subscriptions = await this.pushSubscriptionsRepository
        .createQueryBuilder("subscription")
        .where("subscription.user_id IN (:...userIds)", { userIds })
        .getMany();

      const body = JSON.stringify(payload);
      const sent = await Promise.all(subscriptions.map((subscription) => this.send(subscription, body)));
      result.delivered = sent.filter(Boolean).length;
      result.failed = sent.length - result.delivered;
    } catch (error) {
      this.logger.error("Sending push notifications failed", error);
    }
    return result;
  }

  /**
   * Users who can receive a notification sent from the Settings page.
   * Only admins for now - widen the filter to open it to everyone with a subscribed device.
   */
  async getRecipients(): Promise<PushRecipientDto[]> {
    const subscriptions = await this.pushSubscriptionsRepository.find({ relations: { user: true } });

    const recipients = new Map<string, PushRecipientDto>();
    for (const { user } of subscriptions) {
      if (!user.role?.isAdmin()) continue;
      const recipient = recipients.get(user.id);
      if (recipient) {
        recipient.devices++;
        continue;
      }
      recipients.set(user.id, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        devices: 1,
      });
    }

    return [...recipients.values()].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    );
  }

  /**
   * Send a custom notification to the chosen recipients, or to all of them when none are chosen.
   * Ids outside of `getRecipients` are ignored.
   */
  async sendCustom(sender: User, dto: SendPushDto): Promise<PushSendResultDto> {
    const allowedIds = (await this.getRecipients()).map((recipient) => recipient.id);
    const userIds = dto.userIds?.length ? allowedIds.filter((id) => dto.userIds?.includes(id)) : allowedIds;

    const result = await this.sendToUsers(userIds, { title: dto.title, body: dto.body, url: dto.url || "/" });

    this.logger.log(
      `User ${sender.id} sent "${dto.title}" to ${userIds.length} users: ${result.delivered} delivered, ${result.failed} failed`,
    );
    return { recipients: userIds.length, ...result };
  }

  /**
   * @returns Whether the push service accepted the message
   */
  private async send(subscription: PushSubscription, body: string) {
    try {
      await webPush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        body,
        { TTL: TTL_SECONDS },
      );
      return true;
    } catch (error) {
      // Subscription expired or the user revoked the permission - it will never work again
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
        await this.pushSubscriptionsRepository.delete({ id: subscription.id });
        return false;
      }
      this.logger.warn(`Push to subscription ${subscription.id} failed: ${String(error)}`);
      return false;
    }
  }
}
