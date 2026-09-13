"use client";

import { useGetEvents, useGetOngoingEvents } from "@/utils/api";
import { Event } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import EventCard, { EventCardSkeleton } from "@components/events/EventCard";
import styles from "@components/events/EventList.module.css";
import { Anchor, Container, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCalendarOff } from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo } from "react";





interface EventSectionProps {
  title: string;
  description: string;
  events: Event[];
  total?: number;
}

const EventSection = ({ title, description, events, total = events.length }: EventSectionProps) => (
  <section className={styles.section}>
    <Group justify="space-between" align="flex-end" gap="xs" className={styles.sectionHead}>
      <div>
        <Title order={2}>{title}</Title>
        <Text c="dimmed" size="sm" mt={4}>
          {description}
        </Text>
      </div>
      <Text size="sm" c="dimmed" className="tabular-nums">
        {total} {total === 1 ? "event" : "events"}
      </Text>
    </Group>
    <Stack gap="md">
      {events.map((event, index) => (
        <Anchor
          component={Link}
          key={`event-card-${index}-${event.id}`}
          href={routes.EVENT_DETAIL({ id: event.id })}
          underline="never"
          className={styles.cardLink}
          style={{ "--stagger": index } as React.CSSProperties}
        >
          <EventCard event={event} />
        </Anchor>
      ))}
    </Stack>
  </section>
);

const Home = () => {
  const newTime = useMemo(() => new Date().getTime(), []);
  const { data: ongoingEvents } = useGetOngoingEvents();
  const { data: upcomingEvents } = useGetEvents({ sinceSince: newTime });

  if (!upcomingEvents?.data || !ongoingEvents?.data) {
    return (
      <Container size="xl" aria-busy="true" aria-label="Loading events">
        <Stack gap="md">
          <Title order={2}>Upcoming events</Title>
          <EventCardSkeleton />
          <EventCardSkeleton />
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap={48}>
        {ongoingEvents.data.length > 0 && (
          <EventSection
            title="Happening now"
            description="Events that have already started."
            events={ongoingEvents.data}
            total={ongoingEvents.pagination?.totalCount}
          />
        )}

        {upcomingEvents.data.length > 0 ? (
          <EventSection
            title="Upcoming events"
            description="Open an event to see details and register."
            events={upcomingEvents.data}
            total={upcomingEvents.pagination?.totalCount}
          />
        ) : (
          <section className={styles.empty}>
            <ThemeIcon size={56} radius="lg" variant="light" color="darkBlue">
              <IconCalendarOff size={28} stroke={1.5} />
            </ThemeIcon>
            <Title order={3} mt="md">
              No upcoming events yet
            </Title>
            <Text c="dimmed" maw={420} ta="center" mt={6}>
              When your section publishes a new event, it shows up here. Meanwhile, check your{" "}
              <Anchor component={Link} href={routes.SENT_APPLICATIONS}>
                sent applications
              </Anchor>
              .
            </Text>
          </section>
        )}
      </Stack>
    </Container>
  );
};

export default Home;
