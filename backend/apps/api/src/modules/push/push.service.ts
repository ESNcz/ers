import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import webPush, { WebPushError } from "web-push";

import { CreatePushSubscriptionDto, SendPushDto, UpdateNotificationPreferencesDto } from "@api/models/requests";
import { NotificationPreferenceDto, PushRecipientDto, PushSendResultDto } from "@api/models/responses";
import { User } from "@api/modules/users/entities";

import { NotificationLog } from "./entities/notification-log.entity";
import { NotificationPreference } from "./entities/notification-preference.entity";
import { PushSubscription } from "./entities/push-subscription.entity";
import { NotificationType } from "./enums";

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
    @InjectRepository(NotificationPreference)
    private readonly notificationPreferencesRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationLog)
    private readonly notificationLogsRepository: Repository<NotificationLog>,
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

  /**
   * All notification types of the user, types without a saved preference are on
   */
  async getPreferences(user: User): Promise<NotificationPreferenceDto[]> {
    const saved = await this.notificationPreferencesRepository.find({ where: { user: { id: user.id } } });
    const enabledByType = new Map(saved.map((preference) => [preference.type, preference.enabled]));

    return Object.values(NotificationType).map((type) => ({ type, enabled: enabledByType.get(type) ?? true }));
  }

  async updatePreferences(user: User, dto: UpdateNotificationPreferencesDto) {
    // Last value wins when a type is sent twice
    const enabledByType = new Map(dto.preferences.map((preference) => [preference.type, preference.enabled]));

    await this.notificationPreferencesRepository.upsert(
      [...enabledByType].map(([type, enabled]) => ({ user: { id: user.id }, type, enabled })),
      ["user", "type"],
    );
    return await this.getPreferences(user);
  }

  /**
   * @param type `null` for notifications sent regardless of preferences, e.g. test or admin notifications
   */
  async sendToUser(userId: string, type: NotificationType | null, payload: PushPayload) {
    return await this.sendToUsers([userId], type, payload);
  }

  /**
   * Send to every subscription of the users, skips users who turned the type off.
   * Never throws - a failed push must not fail the action that triggered it
   * @param type `null` for notifications sent regardless of preferences, e.g. test or admin notifications
   * @returns Number of devices delivered and failed
   */
  async sendToUsers(userIds: string[], type: NotificationType | null, payload: PushPayload) {
    const result = { delivered: 0, failed: 0 };
    if (!this.isEnabled || userIds.length === 0) return result;

    try {
      const query = this.pushSubscriptionsRepository
        .createQueryBuilder("subscription")
        .where("subscription.user_id IN (:...userIds)", { userIds });

      if (type) {
        // Missing preference row = type is on
        query.andWhere(
          `NOT EXISTS (
            SELECT 1 FROM notification_preference preference
            WHERE preference.user_id = subscription.user_id AND preference.type = :type AND preference.enabled = false
          )`,
          { type },
        );
      }

      const subscriptions = await query.getMany();

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
   * Send a notification about an entity at most once per user, e.g. scheduled reminders.
   * Users are logged before sending, so concurrent runs or restarts never send twice
   * @param entityId Id of the entity the notification is about, e.g. event id
   * @returns Number of newly notified users and devices delivered and failed
   */
  async sendToUsersOnce(userIds: string[], type: NotificationType, entityId: string | number, payload: PushPayload) {
    if (!this.isEnabled || userIds.length === 0) return { users: 0, delivered: 0, failed: 0 };

    // Only rows actually inserted are returned - users notified before are skipped
    const inserted = await this.notificationLogsRepository
      .createQueryBuilder()
      .insert()
      .values(userIds.map((id) => ({ user: { id }, type, entityId: String(entityId) })))
      .orIgnore()
      .returning(["user_id"])
      .execute();

    const newUserIds = (inserted.raw as { user_id: string }[]).map((row) => row.user_id);
    const result = await this.sendToUsers(newUserIds, type, payload);
    return { users: newUserIds.length, ...result };
  }

  /**
   * Users who can receive a notification sent from the Settings page - everyone with a subscribed device
   */
  async getRecipients(): Promise<PushRecipientDto[]> {
    const subscriptions = await this.pushSubscriptionsRepository.find({ relations: { user: true } });

    const recipients = new Map<string, PushRecipientDto>();
    for (const { user } of subscriptions) {
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

    const result = await this.sendToUsers(userIds, null, { title: dto.title, body: dto.body, url: dto.url || "/" });

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
