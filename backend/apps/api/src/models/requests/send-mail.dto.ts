import type { Address, Attachment } from "nodemailer/lib/mailer";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsObject, IsOptional, IsString } from "class-validator";

class MailAddress implements Address {
	name: string;
	address: string;
}

class MailAttachment implements Attachment {
	filename: string;
	path: string;
}

export class SendEmailDTO {
	@ApiProperty({
		type: () => [MailAddress],
		example: [{ name: "John Doe", address: "info@slabys.cz" }],
	})
	@IsArray()
	recipients: MailAddress[];

	@ApiProperty({ example: "Subject" })
	@IsString()
	subject: string;

	@ApiProperty({ example: "Text content" })
	@IsString()
	@IsOptional()
	text?: string;

	@ApiProperty({ example: "<h1>HTML content</h1><br/><p>Hello {name}</p>" })
	@IsString()
	@IsOptional()
	html?: string;

	// https://nodemailer.com/message/attachments
	/**
	 * filename: "report.pdf",
	 * path: "/absolute/path/to/report.pdf",
	 */
	@ApiProperty({ type: () => [MailAttachment], example: [] })
	@IsArray()
	attachments?: MailAttachment[];

	@ApiProperty({
		type: () => Object,
		example: {
			name: "John Doe",
		},
	})
	@IsObject()
	placeholderReplacement?: Record<string, string>;
}
