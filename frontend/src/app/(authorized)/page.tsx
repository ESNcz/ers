import { getEvents, getOngoingEvents } from "@/utils/api";
import { EventCardSkeleton } from "@components/events/EventCard";
import EventSection from "@components/events/EventSection";
import NoUpcomingEvents from "@components/events/NoUpcomingEvents";
import { Container, Stack, Title } from "@mantine/core";
import { Suspense } from "react";

const HomeEvents = async () => {
  const [ongoingEvents, upcomingEvents] = await Promise.all([
    getOngoingEvents(),
    getEvents({ sinceSince: Date.now() }),
  ]);
  const ongoing = ongoingEvents.data ?? [];
  const upcoming = upcomingEvents.data ?? [];

  return (
    <Stack gap={48}>
      {ongoing.length > 0 && (
        <EventSection title="Happening now" events={ongoing} total={ongoingEvents.pagination?.totalCount} />
      )}

      {upcoming.length > 0 ? (
        <EventSection title="Upcoming events" events={upcoming} total={upcomingEvents.pagination?.totalCount} />
      ) : (
        <NoUpcomingEvents />
      )}
    </Stack>
  );
};

const HomeEventsSkeleton = () => (
  <Stack gap="md" aria-busy="true" aria-label="Loading events">
    <Title order={2}>Upcoming events</Title>
    <EventCardSkeleton />
    <EventCardSkeleton />
  </Stack>
);

const Home = () => (
  <Container size="xl">
    <Suspense fallback={<HomeEventsSkeleton />}>
      <HomeEvents />
    </Suspense>
  </Container>
);

export default Home;
