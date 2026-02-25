import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, FindOptionsSelect, LessThanOrEqual, MoreThanOrEqual, type Repository } from "typeorm";

import { Event, EventLink } from "../../entities";

import { EventFilter } from "../../models";
import { filterSince } from "../../utilities";
import { PhotoService } from "../../../photo";
import type { PaginationOptions } from "utilities/nest/decorators";
import { formatPaginatedResponse } from "utilities/pagination.helper";
import { UpdateEventLinkPartial } from "@api/models/requests/update-event-link.dto";
import { CreateEventLinkPartial } from "@api/models/requests";

interface EventFindOptions {
	visible?: boolean;
	relations?: FindOptionsRelations<Event>;
	select?: FindOptionsSelect<Event>;
}

@Injectable()
export class EventsService {
	constructor(
		@InjectRepository(EventLink)
		private readonly linksRepository: Repository<EventLink>,
		@InjectRepository(Event)
		private readonly eventsRepository: Repository<Event>,
		private readonly photoService: PhotoService,
	) {}

	/**
	 * Find event by ID
	 * @param id Event ID
	 * @param options Find options
	 * @returns
	 */
	findById(id: number, options?: EventFindOptions) {
		return this.eventsRepository.findOne({
			where: { id, visible: options?.visible },
			select: options?.select,
			relations: {
				...options?.relations,
				createdByUser: true,
				links: true,
			},
		});
	}

	findByIdDetailed(id: number, options?: EventFindOptions) {
		return this.findById(id, {
			select: {
				id: true,
				capacity: true,
				codeOfConductLink: true,
				photoPolicyLink: true,
				termsAndConditionsLink: true,
				createdAt: true,
				longDescription: true,
				shortDescription: true,
				registrationDeadline: true,
				registrationForm: {} as never,
				since: true,
				until: true,
				title: true,
				visible: true,
				applications: true,
			},
			relations: {
				...options?.relations,
				createdByUser: true,
				links: true,
				spotTypes: true,
				photo: true,
			},
		});
	}

	save(event: Partial<Event>) {
		return this.eventsRepository.save(new Event(event));
	}

	async findOngoing(options?: EventFindOptions, pagination?: PaginationOptions) {
		const now = new Date();

		const [events, totalCount] = await this.eventsRepository.findAndCount({
			where: {
				since: LessThanOrEqual(now),
				until: MoreThanOrEqual(now),
				visible: options?.visible,
			},
			relations: {
				...options?.relations,
				createdByUser: true,
				links: true,
			},
			order: { since: "ASC" },
			take: pagination?.all ? undefined : pagination?.perPage,
			skip: pagination?.all ? undefined : (pagination?.page - 1) * pagination?.perPage,
		});

		return formatPaginatedResponse<Event>(events, totalCount, pagination);
	}

	async findByFilter(filter?: EventFilter, options?: EventFindOptions, pagination?: PaginationOptions) {
		const [events, totalCount] = await this.eventsRepository.findAndCount({
			where: {
				...filterSince(filter),
				visible: options?.visible,
			},
			relations: {
				...options?.relations,
				createdByUser: true,
				links: true,
			},
			order: {
				since: "DESC",
			},
			// TODO - fix apgination if "all" is undefined fetch all
			take: pagination.all ? undefined : pagination.perPage,
			skip: pagination.all ? undefined : (pagination.page - 1) * pagination.perPage,
		});
		return formatPaginatedResponse<Event>(events, totalCount, pagination);
	}

	/**
	 * Delete event
	 * @param event Event
	 */
	async delete(event: Event) {
		if (event.photo) {
			await this.photoService.delete(event.photo);
		}

		const eventLinks = await this.linksRepository.find({
			where: { event: { id: event.id } },
		});
		if (eventLinks.length > 0) {
			await this.linksRepository.delete(event.links);
		}

		await this.eventsRepository.remove(event);
	}

	async findEventByLink(linkId: number) {
		return this.eventsRepository.findOne({
			where: { links: { id: linkId } },
			relations: {
				links: true,
			},
		});
	}

	async createLinks(linksDto: UpdateEventLinkPartial[] | CreateEventLinkPartial[]) {
		const newLinks = this.linksRepository.create(linksDto.map((link) => ({ name: link.name, link: link.link })));
		return this.linksRepository.save(newLinks);
	}

	/**
	 * Delete event link
	 * @param linkId Event link id
	 */
	async deleteLink(linkId: number) {
		const link = await this.linksRepository.findOne({
			where: { id: linkId },
		});

		await this.linksRepository.delete(link);
	}

	async deleteLinks(eventId: number) {
		const eventLinks = await this.linksRepository.find({
			where: { event: { id: eventId } },
		});

		if (eventLinks.length > 0) {
			await this.linksRepository.delete(eventLinks);
		}
	}
}
