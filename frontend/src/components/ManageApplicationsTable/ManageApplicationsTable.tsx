import { getEventApplicationsManagement } from "@/utils/api";
import routes from "@/utils/routes";
import ManageApplicationsTableView from "@components/ManageApplicationsTable/ManageApplicationsTableView";
import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";

interface ManageApplicationsTableProps {
  eventId: number;
}

const getManagement = async (eventId: number) => {
  try {
    return await getEventApplicationsManagement(eventId);
  } catch (error) {
    // API requires `event.manageApplications` permission
    if (isAxiosError(error) && error.response?.status === 403) redirect(routes.DASHBOARD);
    if (isAxiosError(error) && error.response?.status === 404) notFound();
    throw error;
  }
};

const ManageApplicationsTable = async ({ eventId }: ManageApplicationsTableProps) => {
  const { spots, applications } = await getManagement(eventId);

  return <ManageApplicationsTableView eventId={eventId} eventSpotsList={spots} applications={applications} />;
};

export default ManageApplicationsTable;
