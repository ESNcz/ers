import { Body, Controller, ForbiddenException, Post, UseGuards } from "@nestjs/common";
import { MailService } from "./mail.service";
import { SendEmailDTO } from "@api/models/requests/send-mail.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CookieGuard } from "@api/modules/auth/providers/guards";
import { CurrentUser } from "@api/decorators";
import type { User } from "@api/modules/users";

@ApiTags("Mail")
@Controller("mail")
export class MailController {
	constructor(private readonly mailerService: MailService) {}

	/**
	 * Send e-mail
	 */
	@ApiBearerAuth()
	@UseGuards(CookieGuard)
	@ApiOkResponse({ description: "E-mail sent" })
	@ApiBadRequestResponse({ type: Error, description: "E-mail not sent" })
	@Post()
	async sendMail(@Body() body: SendEmailDTO, @CurrentUser() user: User) {
		if (!user.role.isAdmin()) {
			throw new ForbiddenException("You dont have permissions to send e-mail");
		}

		this.mailerService.testSend();
		// return await this.mailerService.sendMail(body);
	}
}
