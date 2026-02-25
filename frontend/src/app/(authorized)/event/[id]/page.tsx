import { getGetEventsQueryKey } from "@/utils/api";
import { type GetEvents200 } from "@/utils/api.schemas";
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

export const revalidate = 60;

const UseFetchAllEvents = async () => {
  const queryKey = getGetEventsQueryKey();
  const events: GetEvents200 = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}${queryKey[0]}`)
    .then((res) => res.json())
    .catch((e) => console.error(e));

  if (!events?.data) {
    return [];
  }

  return events.data.map((event) => {
    return {
      id: event.id.toString(),
    };
  });
};

export async function generateStaticParams() {
  return UseFetchAllEvents();
}

export default EventDetailPage;
