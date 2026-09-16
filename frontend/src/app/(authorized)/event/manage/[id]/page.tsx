import ManageApplicationsTable from "@components/ManageApplicationsTable/ManageApplicationsTable";
import { Container, Stack } from "@mantine/core";

interface ManageEventApplicationsProps {
  params: Promise<{ id: string }>;
}

const ManageEventApplications = async ({ params }: ManageEventApplicationsProps) => {
  const { id } = await params;

  return (
    <Container size="xl">
      <Stack>
        <ManageApplicationsTable eventId={Number.parseInt(id)} />
      </Stack>
    </Container>
  );
};

export default ManageEventApplications;
