import { Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { CreateAddress } from "./create-address.dto";
import { ApiExtraModels, ApiProperty, refs } from "@nestjs/swagger";
import { InvoiceMethods } from "@api/modules/events/invoice-methods";
import { DateTransform, IsValidDate } from "utilities/nest/class-validator";

export class CreateEventApplicationExistingOrganization {
	/**
	 * Organization ID
	 */
	@IsString()
	id: string;

	@ApiProperty({
		type: "string",
		default: "organization",
		enum: ["organization"],
	})
	type: "organization" = "organization" as const;
}

export class CreateEventApplicationCustomOrganization {
	@IsString()
	name: string;

	@IsString()
	country: string;

	@ApiProperty({
		type: "string",
		default: "custom",
		enum: ["custom"],
	})
	type: "custom" = "custom" as const;
}

@ApiExtraModels(CreateEventApplicationExistingOrganization, CreateEventApplicationCustomOrganization)
export class CreateEventApplication {
	@IsNumber()
	@IsOptional()
	spotTypeId?: number | null;

	@IsOptional()
	@IsObject()
	additionalFormData: object = {};

	@IsEnum(InvoiceMethods)
	invoiceMethod: InvoiceMethods = InvoiceMethods.personal;

	@IsString()
	invoicedTo: string | null;

	@IsObject()
	@IsNotEmptyObject({ nullable: false })
	@Type(() => CreateAddress)
	invoiceAddress: CreateAddress;

	@IsString()
	additionalInformation: string;

	@IsString()
	allergies: string;

	@IsString()
	foodRestriction: string;

	@IsString()
	healthLimitations: string;

	/**
	 * Date until the ID number is valid
	 * @example 2024-12-20T16:48:34.681Z
	 */
	@IsValidDate()
	@Transform(DateTransform)
	validUntil: Date;

	@IsString()
	idNumber: string;

	@ApiProperty({
		type: () => Object,
		oneOf: refs(CreateEventApplicationExistingOrganization, CreateEventApplicationCustomOrganization),
	})
	@IsObject()
	@IsNotEmptyObject()
	@Type(null, {
		keepDiscriminatorProperty: true,
		discriminator: {
			property: "type",
			subTypes: [
				{
					name: "organization",
					value: CreateEventApplicationExistingOrganization,
				},
				{
					name: "custom",
					value: CreateEventApplicationCustomOrganization,
				},
			],
		},
	})
	organization: CreateEventApplicationExistingOrganization | CreateEventApplicationCustomOrganization;
}
