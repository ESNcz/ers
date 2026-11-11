import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import dayjs from "dayjs";
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";

import { CreateSugarCubeDto } from "@api/models/requests";
import { Event, EventApplication } from "@api/modules/events/entities";
import { NotificationType, PushService } from "@api/modules/push";
import { User } from "@api/modules/users/entities";

import { SugarCube } from "./entities/sugar-cube.entity";

const OPEN_DAYS_AFTER_EVENT = 3;
/** Reminder is sent once when sending sugar cubes closes within this time - longer than the cron night gap */
const DEADLINE_REMINDER_HOURS = 24;

const shiftDays = (date: Date, days: number) => {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
};

@Injectable()
export class SugarCubesService {
  private readonly logger = new Logger(SugarCubesService.name);

  constructor(
    @InjectRepository(SugarCube)
    private readonly sugarCubesRepository: Repository<SugarCube>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventApplication)
    private readonly eventApplicationsRepository: Repository<EventApplication>,
    private readonly pushService: PushService,
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

    const saved = await this.sugarCubesRepository.save(sugarCube);

    // Not awaited - the sender should not wait for push services
    void this.pushService.sendToUser(dto.toUserId, NotificationType.SugarCube, {
      title: "You received a sugar cube",
      body: dto.isAnonymous
        ? `Someone sent you a sugar cube at ${event.title}`
        : `${fromUser.firstName} sent you a sugar cube at ${event.title}`,
      url: `/event/${event.id}/sugar-cubes`,
      tag: `sugar-cube-${event.id}`,
    });

    return saved;
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

  /**
   * Remind applicants of events whose sugar cubes close within {@link DEADLINE_REMINDER_HOURS}.
   * Runs every 4 hours during the day (8, 12, 16 and 20 server time `TZ`), so no notification arrives at night.
   * Every user is reminded only once per event
   */
  @Cron("0 8-20/4 * * *")
  async sendDeadlineReminders() {
    if (!this.pushService.isEnabled) return;

    const now = new Date();
    const reminderUntil = new Date(now.getTime() + DEADLINE_REMINDER_HOURS * 60 * 60 * 1000);

    try {
      // closesAt = until + OPEN_DAYS_AFTER_EVENT, closing between now and now + DEADLINE_REMINDER_HOURS
      const events = await this.eventsRepository.find({
        where: {
          visible: true,
          until: Between(shiftDays(now, -OPEN_DAYS_AFTER_EVENT), shiftDays(reminderUntil, -OPEN_DAYS_AFTER_EVENT)),
        },
        relations: { applications: { user: true } },
        select: { id: true, title: true, until: true, applications: { id: true, user: { id: true } } },
      });

      for (const event of events) {
        const userIds = event.applications.map((application) => application.user.id);
        const result = await this.pushService.sendToUsersOnce(userIds, NotificationType.SugarCubeDeadline, event.id, {
          title: "Last chance to send sugar cubes",
          body: `Sending sugar cubes at ${event.title} closes ${dayjs(shiftDays(event.until, OPEN_DAYS_AFTER_EVENT)).format("D. M. [at] HH:mm")}`,
          url: `/event/${event.id}/sugar-cubes`,
          tag: `sugar-cube-deadline-${event.id}`,
        });
        if (result.users > 0) {
          this.logger.log(
            `Sugar cube deadline reminder for event ${event.id} sent to ${result.users} users: ${result.delivered} delivered, ${result.failed} failed`,
          );
        }
      }
    } catch (error) {
      this.logger.error("Sending sugar cube deadline reminders failed", error);
    }
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
