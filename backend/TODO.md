# TODO

- Events
  - [x] Spot types
    - Title
    - Count
    - Price
  - [x] Update photo (admin)
  - [x] Register users
    - [x] Spot updated by creator or admin
    - [x] Status
      - Completed
      - Cancelled
  - [x] Register form
  - [ ] Payment PDF
  - [ ] Payment confirmation PDF/JPG/PNG
  - [ ] Update
  - [x] Filter (registered users)
    - Organization
    - Applicant name
    - Paid

- [x] My sent applications

- Notifications (Web Push, self-hosted - `apps/api/src/modules/push`)
  - [x] Push infrastructure - subscriptions, VAPID, `PushService.sendToUser(s)`, `public/sw.js`
  - [x] Account page switch + test notification, soft prompt banner after login (turns on all types)
  - [x] Settings page - admin sends a custom notification to everyone or selected people (`POST /push/send`)
    - [x] Recipients are only admins for testing - widen `PushService.getRecipients` to open it to everyone
  - [x] Notification types - choose individual notifications
    - [x] `NotificationType` enum: `sugarCube`, `sugarCubeDeadline`, `spotAssigned`, `eventPublished`, `formDeadline`, `registrationReminder`
    - [x] User preferences - `notification_preference` table (user, type, enabled), missing row = enabled,
          so the banner "Turn on" keeps meaning all types
    - [x] `sendToUsers(userIds, type, payload)` skips users who turned the type off
    - [x] Endpoints `GET/PATCH /push/preferences`, checkboxes per type on the Account page
  - [ ] Triggers
    - [x] Sugar cube received - `SugarCubesService.createSugarCube`
    - [x] Sugar cube deadline - `SugarCubesService.sendDeadlineReminders`, every 4 hours 8-20, applicants of events
          whose sugar cubes close within 24 hours (`until` + 3 days)
    - [ ] Assigned spot - `EventApplicationsController.updateUserApplicationSpot` and bulk `updateApplicationsSpot`,
          notify only when the spot actually changed (not on removal, not on re-saving the same spot)
    - [ ] Event created / published - `Event.visible` true on create or false -> true on update, notify once per event;
          decide audience (all users vs. members of the event organisations)
    - [ ] Required additional form deadline reminder - `EventForm.required` + `deadline`, applicants without
          an `EventFormResponse`, e.g. 2 days and on the day before the deadline
    - [ ] Registration deadline reminder - `Event.registrationDeadline`, decide audience (e.g. users of invited
          organisations without an application), e.g. 2 days before
  - [x] Scheduler for reminders - `@nestjs/schedule` cron (hourly), `notification_log` table (user, type, entity id)
        so a reminder is sent only once and survives API restarts - `PushService.sendToUsersOnce`
  - [ ] In-app notification history (`notification` table, bell with unread count)
  - [ ] E-mail notifications (fallback for devices without push, e.g. iOS without the installed app)
