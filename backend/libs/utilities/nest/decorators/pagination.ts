import {
	BadRequestException,
	createParamDecorator,
	type ExecutionContext,
	type ParamDecoratorEnhancer,
} from "@nestjs/common";
import { ApiQuery, type ApiQueryOptions } from "@nestjs/swagger";
import type { Request } from "express";

export interface PaginationOptions {
	page?: number;
	perPage?: number;
	all?: boolean;
}

/**
 * {@link ApiQueryOptions} does not expose default by default
 */
type ApiQueryWithDefault = ApiQueryOptions & {
	default: unknown;
};

/**
 * Enhanced applies Swagger decorators
 * @param defaultOptions Default pagination options
 * @returns
 */
const PaginationTypeEnhancer =
	(defaultOptions?: Partial<PaginationOptions>): ParamDecoratorEnhancer =>
	(target: Record<string, unknown>, propertyKey: string): void => {
		const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);
		ApiQuery(<ApiQueryWithDefault>{
			name: "page",
			type: Number,
			required: false,
			description: "Current page number",
			default: defaultOptions?.page ?? 1,
		})(target, propertyKey, descriptor);
		ApiQuery(<ApiQueryWithDefault>{
			name: "perPage",
			type: Number,
			required: false,
			description: "Number of results per page",
			default: defaultOptions?.perPage ?? 10,
		})(target, propertyKey, descriptor);
		ApiQuery(<ApiQueryWithDefault>{
			name: "all",
			type: Boolean,
			required: false,
			description: "If true, fetches all data (ignores pagination)",
			default: false,
		})(target, propertyKey, descriptor);
	};

/**
 * Pagination
 * @param defaultOptions Default pagination options
 * @param dataOrPipes any[]
 * @returns ParameterDecorator
 */
export const Pagination = (
	defaultOptions?: Partial<PaginationOptions>,
	// biome-ignore lint/suspicious/noExplicitAny: Nest handle dataOrPipes same way
	...dataOrPipes: any[]
) =>
	createParamDecorator(
		(_, context: ExecutionContext) => {
			if (context.getType() !== "http") throw new BadRequestException("Invalid context");

			const request = context.switchToHttp().getRequest<Request>();

			let page = Number(request.query?.page);
			let perPage = Number(request.query?.perPage);
			const all = request.query?.all === "true"; // Convert query param to boolean

			// If `all=true`, disable pagination
			if (all) {
				return <PaginationOptions>{
					all: true,
				};
			}

			// Default values
			page = !Number.isNaN(page) ? page : defaultOptions?.page || 1;
			perPage = !Number.isNaN(perPage) ? perPage : defaultOptions?.perPage || 10;

			// Prevent negative or zero values
			page = Math.max(page, 1);
			perPage = Math.max(perPage, 1);

			return <PaginationOptions>{
				page,
				perPage,
				all: false,
			};
		},
		[PaginationTypeEnhancer(defaultOptions)],
	)(...dataOrPipes);
