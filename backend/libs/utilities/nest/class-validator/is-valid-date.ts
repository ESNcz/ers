import { ValidateBy, type ValidationOptions, buildMessage } from "class-validator";

export function IsValidDate(validationOptions?: ValidationOptions) {
	return ValidateBy(
		{
			name: "isValidDate",
			validator: {
				validate: (value: string | number): boolean => {
					const date = new Date(value);
					return date instanceof Date && !Number.isNaN(date.getTime());
				},
				defaultMessage: buildMessage(
					(eachPrefix) => `${eachPrefix}$property must be a valid ISO date string`,
					validationOptions,
				),
			},
		},
		validationOptions,
	);
}
