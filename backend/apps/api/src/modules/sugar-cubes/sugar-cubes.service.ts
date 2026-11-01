import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";

import { CreateSugarCubeDto } from "@api/models/requests";
import { Event, EventApplication } from "@api/modules/events/entities";
import { User } from "@api/modules/users/entities";

import { SugarCube } from "./entities/sugar-cube.entity";

const OPEN_DAYS_AFTER_EVENT = 3;

const shiftDays = (date: Date, days: number) => {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
};

@Injectable()
export class SugarCubesService {
  constructor(
    @InjectRepository(SugarCube)
    private readonly sugarCubesRepository: Repository<SugarCube>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventApplication)
    private readonly eventApplicationsRepository: Repository<EventApplication>,
  ) {}

  async findSugarCubeById(id: number) {
    const sugarCube = await this.sugarCubesRepository.findOne({
      where: { id },
      relations: ["fromUser.user", "toUser.user"],
    });
    if (!sugarCube) {
      throw new NotFoundException("Sugar cube not found");
    }
    return sugarCube;
  }

  async createSugarCube(eventId: number, fromUser: User, dto: CreateSugarCubeDto) {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException("Event not found");
    }

    // Check if user is registered to the event
    const registration = await this.eventApplicationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: fromUser.id } },
    });
    if (!registration) {
      throw new ForbiddenException("You must be registered to the event to send sugar cubes");
    }

    // Check if recipient is registered to the event
    const recipientRegistration = await this.eventApplicationsRepository.findOne({
      where: { event: { id: eventId }, user: { id: dto.toUserId } },
    });
    if (!recipientRegistration) {
      throw new ForbiddenException("Recipient must be registered to the event");
    }

    // Check time constraints: start of the event until 3 days after event until
    const now = new Date();

    if (now < event.since || now > shiftDays(event.until, OPEN_DAYS_AFTER_EVENT)) {
      throw new ForbiddenException("Sugar cubes can only be sent since start of the event until 3 days after");
    }

    const sugarCube = this.sugarCubesRepository.create({
      message: dto.message,
      isAnonymous: dto.isAnonymous,
      fromUser: registration,
      toUser: recipientRegistration,
      event,
    });

    return await this.sugarCubesRepository.save(sugarCube);
  }

  /**
   * Visible events the user is registered to where sugar cubes can be sent right now
   */
  async getOpenEvents(user: User) {
    const now = new Date();
    const events = await this.eventsRepository.find({
      where: {
        visible: true,
        since: LessThanOrEqual(now),
        until: MoreThanOrEqual(shiftDays(now, -OPEN_DAYS_AFTER_EVENT)),
        applications: { user: { id: user.id } },
      },
      select: { id: true, title: true, until: true },
      order: { until: "ASC" },
    });

    return events.map(({ id, title, until }) => ({
      id,
      title,
      closesAt: shiftDays(until, OPEN_DAYS_AFTER_EVENT),
    }));
  }

  async getReceivedSugarCubes(eventId: number, user: User) {
    return await this.sugarCubesRepository.find({
      where: { event: { id: eventId }, toUser: { user: { id: user.id } } },
      relations: ["fromUser", "fromUser.user", "fromUser.organization"],
      order: { createdAt: "DESC" },
    });
  }

  async getSentSugarCubesByEventId(eventId: number, user: User) {
    return await this.sugarCubesRepository.find({
      where: { event: { id: eventId }, fromUser: { user: { id: user.id } } },
      relations: ["toUser", "toUser.user", "toUser.organization"],
      order: { createdAt: "DESC" },
    });
  }

  async reportSugarCube(id: number) {
    const sugarCube = await this.sugarCubesRepository.findOne({
      where: { id },
      relations: ["toUser", "toUser.user"],
    });
    if (!sugarCube) {
      throw new NotFoundException("Sugar cube not found");
    }
    sugarCube.isReported = true;
    return await this.sugarCubesRepository.save(sugarCube);
  }

  async getReportedSugarCubes(eventId: number) {
    return await this.sugarCubesRepository.find({
      where: { event: { id: eventId }, isReported: true },
      relations: ["fromUser", "fromUser.user", "fromUser.organization", "toUser", "toUser.user", "toUser.organization"],
      order: { createdAt: "DESC" },
    });
  }

  async getRecipientOptions(eventId: number, currentUser: User) {
    const applications = await this.eventApplicationsRepository.find({
      where: { event: { id: eventId } },
      relations: ["user", "organization", "customOrganization"],
    });

    const grouped: Record<string, User[]> = {};

    for (const app of applications) {
      if (app.user.id === currentUser.id) continue;

      const orgName = app.organization?.name || app.customOrganization?.name || "No organization";

      if (!grouped[orgName]) {
        grouped[orgName] = [];
      }
      grouped[orgName].push(app.user);
    }

    return { grouped };
  }
}
