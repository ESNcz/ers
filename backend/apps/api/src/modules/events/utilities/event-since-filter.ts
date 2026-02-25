import { Between, LessThan, MoreThanOrEqual } from "typeorm";
import type { EventFilter } from "../models";

/**
 * Create new since filter
 * @param filter Filter
 * @returns { since: ... }
 */
export const filterSince = (filter?: EventFilter) => {
	if (!filter) return {};

	if (filter.since && filter.to) {
		return Between(filter.since, filter.to);
	}

	if (filter.since) {
		return { since: MoreThanOrEqual(filter.since) };
	}

	if (filter.to) {
		return { since: LessThan(filter.to) };
	}

	return {};
};
