import { Transform } from "class-transformer";
import { Allow, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from "class-validator";
import { DateTransform, IsValidDate, IsValidJsonSchema } from "utilities/nest/class-validator";
import { ApiProperty, OmitType } from "@nestjs/swagger";
import { EventLink } from "@api/modules/events/entities";

export class CreateEventLinkPartial extends OmitType(EventLink, ["id", "event"]) {}

export class CreateEvent {
	@MinLength(6)
	@IsString()
	title: string;

	/**
	 * @example 2024-12-20T16:48:34.681Z
	 */
	@IsValidDate()
	@Transform(DateTransform)
	since: Date;

	/**
	 * @example 2024-12-20T16:48:34.681Z
	 */
	@IsValidDate()
	@Transform(DateTransform)
	until: Date;

	/**
	 * @example 2024-12-20T16:48:34.681Z
	 */
	@IsValidDate()
	@Transform(DateTransform)
	registrationDeadline: string;

	@IsOptional()
	links?: CreateEventLinkPartial[] = [];

	@ApiProperty({
		description: "Short description in JSON format for RichText",
		example: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "left" },
					content: [{ type: "text", text: "Short description" }],
				},
			],
		},
	})
	@IsString()
	longDescription: string;

	@ApiProperty({
		description: "Short description in JSON format for RichText",
		example: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { textAlign: "left" },
					content: [{ type: "text", text: "Short description" }],
				},
			],
		},
	})
	@IsString()
	shortDescription: string;

	@IsBoolean()
	visible?: boolean = true;

	/**
	 * Additional registration properties
	 * ! Must be valid JSON schema
	 */
	@IsOptional()
	@IsValidJsonSchema()
	registrationForm?: object;

	/**
	 * Generate invoices after {@link registrationDeadline}
	 */
	@Allow()
	@IsBoolean()
	generateInvoices: boolean;

	/**
	 * Event capacity
	 */
	@Min(0)
	@IsInt()
	@IsNumber({ allowNaN: false, allowInfinity: false })
	capacity: number;

	/**
	 * @example https://test.cz
	 */
	@IsUrl()
	termsAndConditionsLink: string;

	/**
	 * @example https://test.cz
	 */
	@IsUrl()
	photoPolicyLink: string;

	/**
	 * @example https://test.cz
	 */
	@IsUrl()
	codeOfConductLink: string;
}
