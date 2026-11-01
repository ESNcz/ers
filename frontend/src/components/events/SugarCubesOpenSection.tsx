"use client";

import { OpenSugarCubeEventDto } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { dateWithTime } from "@/utils/time";
import styles from "@components/events/EventList.module.css";
import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

interface SugarCubesOpenSectionProps {
  events: OpenSugarCubeEventDto[];
}

const SugarCubesOpenSection = ({ events }: SugarCubesOpenSectionProps) => (
  <section className={styles.section}>
    <Group justify="space-between" align="flex-end" gap="xs" className={styles.sectionHead}>
      <Title order={2}>Sugar cubes open</Title>
      <Text size="sm" c="dimmed" className="tabular-nums">
        {events.length} {events.length === 1 ? "event" : "events"}
      </Text>
    </Group>
    <Stack gap="md">
      {events.map((event) => (
        <Card key={event.id} withBorder radius="md" padding="md">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Stack gap={4}>
              <Text fw={600}>{event.title}</Text>
              <Text size="sm" c="dimmed">
                Open until {dateWithTime(event.closesAt)}
              </Text>
            </Stack>
            <Button component={Link} href={routes.SUGAR_CUBES({ id: event.id })} color="darkBlue">
              Sugar cubes
            </Button>
          </Group>
        </Card>
      ))}
    </Stack>
  </section>
);

export default SugarCubesOpenSection;
