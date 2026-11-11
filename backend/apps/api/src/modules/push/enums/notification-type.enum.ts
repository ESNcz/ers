/**
 * Kinds of push notifications a user can turn on/off one by one
 */
export enum NotificationType {
  /** Received a sugar cube */
  SugarCube = "sugarCube",
  /** Sending sugar cubes for an event is about to close */
  SugarCubeDeadline = "sugarCubeDeadline",
  /** Got a spot assigned in an event application */
  SpotAssigned = "spotAssigned",
  /** New event was published */
  EventPublished = "eventPublished",
  /** Required additional form is close to its deadline */
  FormDeadline = "formDeadline",
  /** Event registration is close to its deadline */
  RegistrationReminder = "registrationReminder",
}
