import { ApiExtraModels, ApiProperty, PartialType, PickType, refs } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { CreateEventApplication } from "./create-event-application.dto";

export class UpdateEventApplicationExistingOrganization {
	@IsString()
	id: string;

	@ApiProperty({
		type: "string",
		default: "organization",
		enum: ["organization"],
	})
	type: "organization" = "organization" as const;
}

export class UpdateEventApplicationCustomOrganization {
	@IsNumber()
	@IsOptional()
	id?: number;

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

@ApiExtraModels(UpdateEventApplicationExistingOrganization, UpdateEventApplicationCustomOrganization)
export class UpdateEventApplication extends PartialType(
	PickType(CreateEventApplication, [
		"idNumber",
		"validUntil",
		"invoicedTo",
		"invoiceMethod",
		"allergies",
		"foodRestriction",
		"healthLimitations",
		"additionalInformation",
		"invoiceAddress",
	]),
) {
	@ApiProperty({
		type: () => Object,
		oneOf: refs(UpdateEventApplicationExistingOrganization, UpdateEventApplicationCustomOrganization),
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
					value: UpdateEventApplicationExistingOrganization,
				},
				{
					name: "custom",
					value: UpdateEventApplicationCustomOrganization,
				},
			],
		},
	})
	organization: UpdateEventApplicationExistingOrganization | UpdateEventApplicationCustomOrganization;
}
