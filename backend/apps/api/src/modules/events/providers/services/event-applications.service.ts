import { Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
import type { PaginationOptions } from "utilities/nest/decorators";
import { formatPaginatedResponse } from "utilities/pagination.helper";
import { EventApplication, EventCustomOrganization } from "../../entities";
import { EventFilter } from "../../models";
import { filterSince } from "../../utilities";

interface FindEventOptions {
	filter?: EventFilter;
	relations?: FindOneOptions<EventApplication>["relations"];
}

@Injectable()
export class EventApplicationsService {
	constructor(
		@InjectRepository(EventApplication)
		private readonly eventApplicationRepository: Repository<EventApplication>,
		@InjectRepository(EventCustomOrganization)
		private readonly eventCustomOrganizationRepository: Repository<EventCustomOrganization>,
		@InjectEntityManager()
		private readonly entityManager: EntityManager,
	) {}

	/**
	 * Find event application by ID
	 * @param id Event application ID
	 * @param options options
	 * @returns
	 */
	findById(id: number, options?: FindOneOptions<EventApplication>) {
		return this.eventApplicationRepository.findOne({
			...(options ?? {}),
			where: { id },
			relations: {
				...(options?.relations ?? {}),
				user: true,
				spotType: true,
			},
		});
	}

	/**
	 * Find event applications by event ID
	 * @param id
	 * @returns
	 */
	findByEventId(id: number) {
		return this.eventApplicationRepository.find({
			where: { event: { id } },
			relations: {
				organization: true,
				event: true,
				user: {
					personalAddress: true,
				},
				customOrganization: true,
				invoiceAddress: true,
			},
		});
	}

	/**
	 * Find applications by user ID
	 * @param id User ID
	 * @param options options
	 * @param pagination Pagination
	 * @returns Array of user applications
	 */
	findByUserId(id: string, options?: FindEventOptions, pagination?: PaginationOptions) {
		return this.eventApplicationRepository.find({
			where: {
				user: { id },
				// Apply event filters
				...(options?.filter ? { event: filterSince(options.filter) } : {}),
			},
			relations: {
				event: {
					createdByUser: true,
				},
				spotType: true,
			},
			// TODO - fix apgination if "all" is undefined fetch all
			take: pagination.all ? undefined : pagination.perPage,
			skip: pagination.all ? undefined : (pagination.page - 1) * pagination.perPage,
		});
	}

	/**
	 * @param id User ID
	 * @param options options
	 * @param pagination Pagination
	 * @returns
	 */
	async findByUserIdDetailed(id: string, options?: FindEventOptions, pagination?: PaginationOptions) {
		const [eventApplications, totalCount] = await this.eventApplicationRepository.findAndCount({
			where: {
				user: { id },
				// Apply event filters
				...(options?.filter ? { event: filterSince(options.filter) } : {}),
			},
			select: {
				id: true,
				additionalData: true as never,
				createdAt: true,
				idNumber: true,
			},
			relations: {
				customOrganization: true,
				organization: true,
				user: true,
				spotType: true,
				event: true,
				invoiceAddress: true,
				...options?.relations,
			},
			take: pagination?.all ? pagination.perPage : undefined,
			skip: pagination?.all ? (pagination.page - 1) * pagination.perPage : undefined,
		});
		return formatPaginatedResponse(eventApplications, totalCount, pagination);
	}

	/**
	 * Find event application for user and event id
	 * @param eventId
	 * @param userId
	 * @param options options
	 * @returns
	 */
	findByEventAndUserId(eventId: number, userId: string, options?: FindEventOptions) {
		return this.eventApplicationRepository.findOne({
			where: {
				user: { id: userId },
				event: { id: eventId },
			},
			select: {
				id: true,
				additionalData: true as never,
				createdAt: true,
				idNumber: true,
			},
			relations: {
				customOrganization: true,
				organization: true,
				user: true,
				spotType: true,
				event: true,
				...options?.relations,
			},
		});
	}

	/**
	 * Find applications by event ID detailed (with relations)
	 * @param id Event ID
	 * @param options
	 * @returns
	 */
	findByEventIdDetailed(id: number, options?: FindEventOptions) {
		return this.eventApplicationRepository.find({
			where: { event: { id } },
			select: {
				id: true,
				additionalData: true,
				createdAt: true,
				idNumber: true,
				invoiceMethod: true,
				validUntil: true,
				allergies: true,
				foodRestriction: true,
				healthLimitations: true,
				additionalInformation: true,
				invoicedTo: true,
				priority: true,
			},
			relations: {
				...options?.relations,
				customOrganization: true,
				organization: true,
				user: true,
				spotType: true,
				invoiceAddress: true,
			},
			order: {
				organization: {
					name: "ASC",
				},
				priority: "ASC",
			},
		});
	}

	findByIds(ids: number[], options?: FindOneOptions<EventApplication>) {
		return this.eventApplicationRepository.find({
			...(options ?? {}),
			where: ids.map((id) => ({ id })),
		});
	}

	/**
	 * Save application data
	 * @param data
	 * @returns
	 */
	async save(data: Partial<EventApplication>) {
		return this.eventApplicationRepository.save(data);
	}

	async updatePriorities(priorities: { applicationId: number; priority: number }[]) {
		return this.entityManager.transaction(async (em) => {
			for (const { applicationId, priority } of priorities) {
				await em.update(EventApplication, applicationId, { priority });
			}
		});
	}

	/**
	 * Delete event application
	 * @param application Application
	 */
	async delete(application: EventApplication) {
		await this.eventApplicationRepository.remove(application);
	}

	/**
	 * Delete event application
	 * @param customOrganization
	 */
	async deleteCustomOrganizationInApplication(customOrganization: EventCustomOrganization) {
		await this.eventCustomOrganizationRepository.remove(customOrganization);
	}

	/**
	 * @param eventId
	 * @param userId
	 * @returns True, if application exist
	 */
	exist(eventId: number, userId?: string) {
		return this.eventApplicationRepository.existsBy({
			event: { id: eventId },
			user: { id: userId },
		});
	}
}
