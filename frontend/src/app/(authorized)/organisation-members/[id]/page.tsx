import MyOrganisationMemberList from "@components/MyOrganisationMemberList/MyOrganisationMemberList";
import { Container } from "@mantine/core";

interface UseFetchAllEventsProps {
  params: Promise<{ id: string }>;
}

const OrganisationMembersPage = async ({ params }: UseFetchAllEventsProps) => {
  const { id: organizationId } = await params;
  return (
    <Container size="xl">
      <MyOrganisationMemberList organizationId={organizationId} />
    </Container>
  );
};

export default OrganisationMembersPage;
