"use client";

import { useGetEvents, useGetOngoingEvents } from "@/utils/api";
import routes from "@/utils/routes";
import EventCard from "@components/events/EventCard";
import { Anchor, Center, Container, Loader, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import React, { useMemo } from "react";

const Home = () => {
  const newTime = useMemo(() => new Date().getTime(), []);
  const { data: ongoingEvents } = useGetOngoingEvents();
  const { data: upcomingEvents } = useGetEvents({ sinceSince: newTime });

  if (!upcomingEvents?.data || !ongoingEvents?.data) {
    return null;
  }

  return (
    <Container size="xl">
      <Stack>
        {ongoingEvents && (
          <Stack>
            {ongoingEvents.data.length > 0 && (
              <>
                <Title>Ongoing Events</Title>

                {ongoingEvents.data.map((event, index) => (
                  <Anchor
                    component={Link}
                    key={`event-card-${index}-${event.id}`}
                    href={routes.EVENT_DETAIL({ id: event.id })}
                    underline="never"
                  >
                    <EventCard event={event} />
                  </Anchor>
                ))}
              </>
            )}
          </Stack>
        )}
        <Title>Upcoming Events</Title>
        {upcomingEvents ? (
          <Stack>
            {upcomingEvents.data.length > 0 ? (
              upcomingEvents.data.map((event, index) => (
                <Anchor
                  component={Link}
                  key={`event-card-${index}-${event.id}`}
                  href={routes.EVENT_DETAIL({ id: event.id })}
                  underline="never"
                >
                  <EventCard event={event} />
                </Anchor>
              ))
            ) : (
              <Text>No upcoming events</Text>
            )}
          </Stack>
        ) : (
          <Center>
            <Loader />
          </Center>
        )}
      </Stack>
    </Container>
  );
};

export default Home;
