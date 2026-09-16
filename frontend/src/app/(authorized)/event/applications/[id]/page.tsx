import ApplicationsTable from "@components/ApplicationsTable/ApplicationsTable";
import { Container, Stack } from "@mantine/core";

interface ManageEventApplicationsProps {
  params: Promise<{ id: string }>;
}

const EventApplications = async ({ params }: ManageEventApplicationsProps) => {
  const { id } = await params;

  return (
    <Container size="xl">
      <Stack>
        <ApplicationsTable eventId={Number.parseInt(id)} />
      </Stack>
    </Container>
  );
};

export default EventApplications;
