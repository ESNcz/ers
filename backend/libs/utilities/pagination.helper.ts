import type { PaginationOptions } from "utilities/nest/decorators";

// type FormatPaginatedResponseDataType = Event[] | EventApplication[] | User[] | OrganizationMember[]

export type FormatPaginatedResponseType<T> = {
	data: T[]; //Event[] | EventApplication[] | User[] | OrganizationMember[]
	pagination: {
		currentPage: number;
		perPage: number;
		maxPages: number;
	};
};

export function formatPaginatedResponse<T>(
	data: T[], //Event[] | EventApplication[] | User[] | OrganizationMember[],
	totalCount: number,
	pagination: PaginationOptions,
): FormatPaginatedResponseType<T> {
	return {
		data,
		pagination: {
			currentPage: pagination?.page || 1,
			perPage: pagination?.perPage || 10,
			maxPages: pagination?.all ? 1 : Math.ceil(totalCount / pagination?.perPage) || undefined,
		},
	};
}
