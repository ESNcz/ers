import { MailerService as NestMailerModule } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: NestMailerModule,
  ) {}

  testSend() {
    this.mailerService
      .sendMail({
        from: { name: "No Reply", address: this.configService.getOrThrow<string>("MAIL_USER") },
        to: [{ name: "No Reply", address: this.configService.getOrThrow<string>("MAIL_USER") }],
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
}
