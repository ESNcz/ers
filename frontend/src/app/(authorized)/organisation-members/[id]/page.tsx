import OrganizationsMemberList from "@components/OrganizationsMemberList/OrganizationsMemberList";
import { Container } from "@mantine/core";

interface UseFetchAllEventsProps {
  params: Promise<{ id: string }>;
}

const OrganisationMembersPage = async ({ params }: UseFetchAllEventsProps) => {
  const { id: organizationId } = await params;
  return (
    <Container size="xl">
      <OrganizationsMemberList organizationId={organizationId} />
    </Container>
  );
};

export default OrganisationMembersPage;
