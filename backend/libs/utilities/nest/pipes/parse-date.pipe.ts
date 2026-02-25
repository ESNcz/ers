import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { isISO8601 } from "class-validator";

interface ParseDatePipeOptions {
	required: boolean;
}

export class ParseDatePipe implements PipeTransform {
	constructor(private readonly options?: ParseDatePipeOptions) {}

	transform(value: string, metadata: ArgumentMetadata) {
		if (!value && !this.options?.required) return undefined;

		if (isISO8601(value)) return new Date(value);

		const number = Number.parseInt(value);
		if (Number.isNaN(number)) throw new BadRequestException("Invalid date");
		return new Date(number);
	}
}
