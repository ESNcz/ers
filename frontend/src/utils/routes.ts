export const routes = {
  // Initial setup
  INIT: "/initialise",
  // App settings
  SETTINGS: "/settings",
  // --- Unauthorized ---
  // Any unauthorized routes need to be added to CustomHooksLoader and middleware.ts
  LOGIN: "/login",
  REGISTER: "/registration",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/forgot-password/reset",
  VERIFY: "/verify",
  LOGOUT: "/api/auth/logout",

  // --- Authorized ---
  DASHBOARD: "/",
  SENT_APPLICATIONS: "/sent-applications",
  ACCOUNT: "/account",
  MY_ORGANISATION: `/my-organisation`,
  MANAGE_ORGANISATION_DETAIL: (props: { id: string }) => `/my-organisation/${props.id}`,
  // --- Management ---
  MANAGE_EVENTS: "/manage-events",
  MANAGE_PEOPLE: "/manage-people",
  MANAGE_ORGANISATIONS: "/manage-organisations",

  // Events
  EVENT_DETAIL: (props: { id: number }) => `/event/${props.id}`,
  EVENT_APPLICATIONS: (props: { id: number }) => `/event/applications/${props.id}`,
  EVENT_APPLICATIONS_MANAGE: (props: { id: number }) => `/event/manage/${props.id}`,
  SUGAR_CUBES: (props: { id: number }) => `/event/${props.id}/sugar-cubes`,

  // Organization
  ORGANISATION_MEMBERS: (props: { id: string }) => `/organisation-members/${props.id}`,
};

export default routes;
