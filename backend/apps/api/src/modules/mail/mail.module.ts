import { Module } from "@nestjs/common";
import { MailService } from "@api/modules/mail/mail.service";
import { MailController } from "@api/modules/mail/mail.controller";
import { ConfigModule } from "@nestjs/config";
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Module({
	imports: [
		ConfigModule,
		NestMailerModule.forRoot({
			transport: {
				// service: "Gmail",
				host: process.env.MAIL_HOST,
				port: 587,
				// secure: true,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASS,
				},
			},
			template: {
				dir: `${process.cwd()}/templates`,
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
	],
	controllers: [MailController],
	providers: [MailService],
	exports: [MailService, NestMailerModule],
})
export class MailModule {}
