import { getEventApplicationsOverview } from "@/utils/api";
import { getServerCurrentUser } from "@/utils/getServerCurrentUser";
import routes from "@/utils/routes";
import ApplicationsTableView from "@components/ApplicationsTable/ApplicationsTableView";
import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";

interface ApplicationsTableProps {
  eventId: number;
}

const getOverview = async (eventId: number) => {
  try {
    return await getEventApplicationsOverview(eventId);
  } catch (error) {
    // API allows only admins and organisation managers
    if (isAxiosError(error) && error.response?.status === 403) redirect(routes.DASHBOARD);
    if (isAxiosError(error) && error.response?.status === 404) notFound();
    throw error;
  }
};

const ApplicationsTable = async ({ eventId }: ApplicationsTableProps) => {
  // Deduplicated with the authorized layout
  const [currentUser, { event, applications, userOrganisationMemberships }] = await Promise.all([
    getServerCurrentUser(),
    getOverview(eventId),
  ]);

  return (
    <ApplicationsTableView
      eventDetail={event}
      applications={applications}
      userOrganisationMemberships={userOrganisationMemberships}
      currentUser={currentUser}
    />
  );
};

export default ApplicationsTable;
