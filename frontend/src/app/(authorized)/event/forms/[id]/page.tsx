import { hasSomePermissions } from "@/utils/checkPermissions";
import { getServerCurrentUser } from "@/utils/getServerCurrentUser";
import routes from "@/utils/routes";
import ManageEventFormsPanel from "@components/eventForms/ManageEventFormsPanel";
import { Container } from "@mantine/core";
import { notFound, redirect } from "next/navigation";

interface ManageEventFormsPageProps {
  params: Promise<{ id: string }>;
}

// Separate from `event/manage/[id]`, which requires `event.manageApplications` - forms belong to event editors
const ManageEventFormsPage = async ({ params }: ManageEventFormsPageProps) => {
  const { id } = await params;
  const parsedId = Number.parseInt(id);
  if (Number.isNaN(parsedId)) notFound();

  const currentUser = await getServerCurrentUser();
  if (!hasSomePermissions(currentUser.role, ["event.create", "event.update"])) redirect(routes.DASHBOARD);

  return (
    <Container size="xl">
      <ManageEventFormsPanel eventId={parsedId} />
    </Container>
  );
};

export default ManageEventFormsPage;
