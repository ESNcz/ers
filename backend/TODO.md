# TODO

- Events
  - [x] Spot types
    - Title
    - Count
    - Price
  - [x] Update photo (admin)
  - [ ] Register users
    - [ ] Spot updated by creator or admin
    - [ ] Status
      - Completed
      - Cancelled
  - [x] Register form
  - [ ] Payment PDF
  - [ ] Payment confirmation PDF/JPG/PNG
  - [ ] Update
  - [ ] Filter (registered users)
    - Organization
    - Applicant name
    - Paid

- [ ] My sent applications

- Notifications (Web Push, self-hosted - `apps/api/src/modules/push`)
  - [x] Push infrastructure - subscriptions, VAPID, `PushService.sendToUser(s)`, `public/sw.js`
  - [x] Account page switch + test notification, soft prompt banner after login (turns on all types)
  - [ ] Notification types - choose individual notifications
    - [ ] `NotificationType` enum: `sugarCube`, `spotAssigned`, `eventPublished`, `formDeadline`, `registrationReminder`
    - [ ] User preferences - `notification_preference` table (user, type, enabled), missing row = enabled,
          so the banner "Turn on" keeps meaning all types
    - [ ] `sendToUsers(userIds, type, payload)` skips users who turned the type off
    - [ ] Endpoints `GET/PATCH /push/preferences`, checkboxes per type on the Account page
  - [ ] Triggers
    - [x] Sugar cube received - `SugarCubesService.createSugarCube`
    - [ ] Assigned spot - `EventApplicationsController.updateUserApplicationSpot` and bulk `updateApplicationsSpot`,
          notify only when the spot actually changed (not on removal, not on re-saving the same spot)
    - [ ] Event created / published - `Event.visible` true on create or false -> true on update, notify once per event;
          decide audience (all users vs. members of the event organisations)
    - [ ] Required additional form deadline reminder - `EventForm.required` + `deadline`, applicants without
          an `EventFormResponse`, e.g. 2 days and on the day before the deadline
    - [ ] Registration deadline reminder - `Event.registrationDeadline`, decide audience (e.g. users of invited
          organisations without an application), e.g. 2 days before
  - [ ] Scheduler for reminders - `@nestjs/schedule` cron (hourly), `notification_log` table (user, type, entity id)
        so a reminder is sent only once and survives API restarts
  - [ ] In-app notification history (`notification` table, bell with unread count)
  - [ ] E-mail notifications (fallback for devices without push, e.g. iOS without the installed app)
