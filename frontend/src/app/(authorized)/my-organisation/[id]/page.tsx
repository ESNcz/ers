import MyOrganisationMemberList from "@components/MyOrganisationMemberList/MyOrganisationMemberList";
import { Container } from "@mantine/core";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const MyOrganisationDetailPage = async ({ params }: EventDetailPageProps) => {
  const { id: organisationId } = await params;

  return (
    <Container size="xl">
      <MyOrganisationMemberList organizationId={organisationId} />
    </Container>
  );
};

export default MyOrganisationDetailPage;
