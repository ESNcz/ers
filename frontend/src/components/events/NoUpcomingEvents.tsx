"use client";

import routes from "@/utils/routes";
import styles from "@components/events/EventList.module.css";
import { Anchor, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCalendarOff } from "@tabler/icons-react";
import Link from "next/link";

// Client component - `component={Link}` passes a function prop, which a server component can't serialize
const NoUpcomingEvents = () => (
  <section className={styles.empty}>
    <ThemeIcon size={56} radius="lg" variant="light">
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
);

export default NoUpcomingEvents;
