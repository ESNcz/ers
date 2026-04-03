"use client";

import { useGetUserApplications } from "@/utils/api";
import routes from "@/utils/routes";
import EventCard from "@components/events/EventCard";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useMemo } from "react";

const SentApplicationsPage = () => {
  const now = useMemo(() => new Date().getTime(), []);
  const { data: upcomingApplications } = useGetUserApplications({
    sinceSince: now,
  });
  const { data: pastApplications } = useGetUserApplications({
    toSince: now,
  });

  const pastEvents = useMemo(() => {
    if (!pastApplications?.data) return [];
    return [...pastApplications.data].sort(
      (a, b) =>
        new Date(b.event.since).getTime() - new Date(a.event.since).getTime(),
    );
  }, [pastApplications]);

  return (
    <Container size="xl">
      <Stack>
        <Title>Sent Applications</Title>
        <Stack>
          <Title order={2} size="xl">
            Upcoming
          </Title>
          {upcomingApplications?.data && upcomingApplications.data.length > 0 ? (
            upcomingApplications.data.map((eventApplication, index) => (
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
            <Text>No upcoming registrations.</Text>
          )}
        </Stack>
        <Stack>
          <Title order={2} size="xl">
            Past
          </Title>
          {pastEvents.length > 0 ? (
            pastEvents.map((eventApplication, index) => (
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
            <Text>No past registrations.</Text>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default SentApplicationsPage;
