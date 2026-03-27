"use client";

import { useGetUserApplications } from "@/utils/api";
import routes from "@/utils/routes";
import EventCard from "@components/events/EventCard";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useMemo } from "react";

const SentApplicationsPage = () => {
  const now = useMemo(() => new Date().getTime(), []);
  const { data: ongoingApplications } = useGetUserApplications({
    toSince: now,
  });
  const { data: upcomingApplications } = useGetUserApplications({
    sinceSince: now,
  });

  const ongoingEvents = useMemo(() => {
    if (!ongoingApplications?.data) return [];
    const nowDate = new Date();
    return ongoingApplications.data.filter(
      (app) => new Date(app.event.until) >= nowDate,
    );
  }, [ongoingApplications]);

  const pastEvents = useMemo(() => {
    if (!ongoingApplications?.data) return [];
    const nowDate = new Date();
    return ongoingApplications.data
      .filter((app) => new Date(app.event.until) < nowDate)
      .sort(
        (a, b) =>
          new Date(b.event.since).getTime() -
          new Date(a.event.since).getTime(),
      );
  }, [ongoingApplications]);

  return (
    <Container size="xl">
      <Stack>
        <Title>Sent Applications</Title>
        {ongoingEvents.length > 0 && (
          <Stack>
            <Title order={2} size="xl">
              Ongoing Events
            </Title>
            {ongoingEvents.map((eventApplication, index) => (
              <Anchor
                component={Link}
                key={`event-card-${index}-${eventApplication.id}`}
                href={routes.EVENT_DETAIL({ id: eventApplication.event.id })}
                underline="never"
              >
                <EventCard event={eventApplication.event} />
              </Anchor>
            ))}
          </Stack>
        )}
        <Stack>
          <Title order={2} size="xl">
            Upcoming Events
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
            <Text>No upcoming events...</Text>
          )}
        </Stack>
        <Stack>
          <Title order={2} size="xl">
            Past Events
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
            <Text>No past events...</Text>
          )}
        </Stack>
      </Stack>
    </Container>
  );
};

export default SentApplicationsPage;
