import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MailerService as NestMailerModule } from "@nestjs-modules/mailer";
import { dateWithTime } from "utilities/time";

export interface SpotAssignmentNotificationParams {
  to: { name: string; address: string };
  eventId: number;
  eventName: string;
  since: Date;
  until: Date;
  spotName: string;
  spotPrice: number;
  spotCurrency: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: NestMailerModule,
  ) {}

  testSend() {
    this.mailerService
      .sendMail({
        from: {
          name: "No Reply",
          address: this.configService.get<string>("MAIL_USER"),
        },
        to: [
          {
            name: "No Reply",
            address: this.configService.get<string>("MAIL_USER"),
          },
        ],
        subject: "Testing Mail Module",
        template: "verify-email",
        context: {
          name: "John Doe",
          link: this.configService.get<string>("WEB_DOMAIN"),
        },
      })
      .then((value) => {
        console.warn(value);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  /**
   * Send a spot assignment notification email to a single participant.
   */
  async sendSpotAssignmentNotification(
    params: SpotAssignmentNotificationParams,
  ) {
    const eventLink = `${this.configService.getOrThrow<string>("WEB_DOMAIN")}/event/${params.eventId}`;

    return this.mailerService.sendMail({
      from: {
        name: "No Reply",
        address: this.configService.get<string>("MAIL_USER"),
      },
      to: [params.to],
      subject: `Your spot has been assigned for ${params.eventName}`,
      template: "spot-assignment",
      context: {
        userName: params.to.name,
        eventName: params.eventName,
        since: dateWithTime(params.since),
        until: dateWithTime(params.until),
        spotName: params.spotName,
        spotPrice: params.spotPrice,
        spotCurrency: params.spotCurrency,
        eventLink,
      },
    });
  }
}
