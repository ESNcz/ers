import EventDetail from "@components/events/EventDetail";
import { Container } from "@mantine/core";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const { id } = await params;
  const parsedId = Number.parseInt(id);
  return (
    <Container size="xl">
      <EventDetail id={parsedId} />
    </Container>
  );
};

export default EventDetailPage;
