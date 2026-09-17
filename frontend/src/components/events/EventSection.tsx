"use client";

import { Event } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import EventCard from "@components/events/EventCard";
import styles from "@components/events/EventList.module.css";
import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import React from "react";

interface EventSectionProps {
  title: string;
  events: Event[];
  total?: number;
}

const EventSection = ({ title, events, total = events.length }: EventSectionProps) => (
  <section className={styles.section}>
    <Group justify="space-between" align="flex-end" gap="xs" className={styles.sectionHead}>
      <Title order={2}>{title}</Title>
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

export default EventSection;
