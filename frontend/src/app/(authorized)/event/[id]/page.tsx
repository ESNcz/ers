import { getEventDetailView } from "@/utils/api";
import EventDetail from "@components/events/EventDetail";
import EventDetailSkeleton from "@components/events/EventDetailSkeleton";
import { Container } from "@mantine/core";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const EventDetailContent = async ({ id }: { id: number }) => {
  try {
    const { event, userApplicationId, isManager } = await getEventDetailView(id);
    return <EventDetail eventDetail={event} userApplicationId={userApplicationId} isManager={isManager} />;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) notFound();
    throw error;
  }
};

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const { id } = await params;
  const parsedId = Number.parseInt(id);
  if (Number.isNaN(parsedId)) notFound();

  return (
    <Container size="xl">
      <Suspense fallback={<EventDetailSkeleton />}>
        <EventDetailContent id={parsedId} />
      </Suspense>
    </Container>
  );
};

export default EventDetailPage;
