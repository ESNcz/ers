import routes from "@/utils/routes";
import { MainLink } from "@components/layout/LayoutHeader";

export const manageEventLink: MainLink = {
  link: routes.MANAGE_EVENTS,
  label: "Manage Events",
  permissions: ["event.create", "event.update", "event.duplicate"],
};

export const manageOrganisationLink: MainLink = {
  link: routes.MANAGE_ORGANISATIONS,
  label: "Manage Organisations",
  permissions: [
    "organisation.create",
    "organisation.update",
    "organisation.addUser",
    "organisation.updateUser",
    "organisation.deleteUser",
  ],
};

// Empty permission --> only admin
export const managePeopleLink: MainLink = { link: routes.MANAGE_PEOPLE, label: "Manage People", permissions: [] };

// Empty permission --> only admin
export const settingsLink: MainLink = { link: routes.SETTINGS, label: "Settings", permissions: [] };
