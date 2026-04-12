"use client";

import { useGetUserApplications } from "@/utils/api";
import routes from "@/utils/routes";
import EventCard from "@components/events/EventCard";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useMemo } from "react";

const SentApplicationsPage = () => {
  const now = useMemo(() => {
    return new Date().getTime();
  }, []);
  const { data: upcomingEvents } = useGetUserApplications({ sinceSince: now });
  const { data: pastEvents } = useGetUserApplications({ toSince: now });

  return (
    <Container size="xl">
      <Stack>
        <Title>Sent Applications</Title>
        {upcomingEvents && (
          <Stack>
            <Title order={2} size="xl">
              Upcoming Events
            </Title>
            {upcomingEvents?.data && upcomingEvents.data.length >= 1 ? (
              upcomingEvents.data.map((eventApplication, index) => (
                <Anchor
                  component={Link}
                  key={`event-card-${index}-${eventApplication.id}`}
                  href={routes.EVENT_DETAIL({ id: eventApplication.event.id })}
                  underline="never"
                >
                  <EventCard event={eventApplication.event} />
                </Anchor>
              ))
            ) : (
              <Text>No upcoming events...</Text>
            )}
          </Stack>
        )}
        {pastEvents && (
          <Stack>
            <Title order={2} size="xl">
              Past Events
            </Title>
            {pastEvents?.data && pastEvents.data.length > 0 ? (
              pastEvents?.data?.map((eventApplication, index) => (
                <Anchor
                  component={Link}
                  key={`event-card-${index}-${eventApplication.id}`}
                  href={routes.EVENT_DETAIL({ id: eventApplication.event.id })}
                  underline="never"
                >
                  <EventCard event={eventApplication.event} />
                </Anchor>
              ))
            ) : (
              <Text>No past events...</Text>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default SentApplicationsPage;
