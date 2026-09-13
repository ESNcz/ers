"use client";

import { Event } from "@/utils/api.schemas";
import { dayMonthYear } from "@/utils/time";
import ApiImage from "@components/ApiImage/ApiImage";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import styles from "@components/events/EventCard.module.css";
import { Badge, Box, Card, Group, Progress, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconCalendarEvent, IconUsersGroup } from "@tabler/icons-react";
import dayjs from "dayjs";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { photo, title, since, until, applications, capacity, shortDescription, registrationDeadline } = event;

  const filled = applications.length;
  const fillRatio = capacity > 0 ? Math.min(filled / capacity, 1) : 0;
  const isRegistrationClosed = dayjs(registrationDeadline).isBefore(dayjs());

  return (
    <Card p={0} className={styles.card}>
      <div className={styles.layout}>
        <Box className={styles.media}>
          <ApiImage src={photo?.id} h="100%" w="100%" fit="cover" alt={`Cover photo for ${title}`} />
        </Box>
        <Stack className={styles.body} gap="md">
          <Stack gap={8}>
            <Group gap="xs" wrap="wrap">
              <Badge variant="light" color={isRegistrationClosed ? "gray" : "green"} radius="sm" tt="none" fw={600}>
                {isRegistrationClosed ? "Registration closed" : `Register by ${dayMonthYear(registrationDeadline)}`}
              </Badge>
            </Group>
            <Title order={3} className={styles.title}>
              {title}
            </Title>
            <Group gap="lg" wrap="wrap">
              <Group gap={6} wrap="nowrap">
                <IconCalendarEvent size={18} stroke={1.75} className={styles.metaIcon} aria-hidden />
                <Text size="sm" c="dimmed" component="time" dateTime={since}>
                  {dayMonthYear(since)} – {dayMonthYear(until)}
                </Text>
              </Group>
              <Group gap={6} wrap="nowrap">
                <IconUsersGroup size={18} stroke={1.75} className={styles.metaIcon} aria-hidden />
                <Text size="sm" c="dimmed" className="tabular-nums">
                  {filled} / {capacity} applied
                </Text>
              </Group>
            </Group>
          </Stack>

          <Box className={styles.description}>
            <RichTextRenderer content={shortDescription} />
          </Box>

          <Progress
            value={fillRatio * 100}
            size={4}
            radius="xl"
            color={fillRatio >= 1 ? "orange" : "cyan"}
            aria-label={`${filled} of ${capacity} spots applied for`}
            className={styles.progress}
          />
        </Stack>
      </div>
    </Card>
  );
};

export const EventCardSkeleton = () => (
  <Card p={0} className={styles.card} aria-hidden>
    <div className={styles.layout}>
      <Skeleton className={styles.media} radius={0} />
      <Stack className={styles.body} gap="sm">
        <Skeleton h={20} w={140} />
        <Skeleton h={28} w="60%" />
        <Skeleton h={14} w="40%" />
        <Skeleton h={14} w="90%" mt="sm" />
        <Skeleton h={14} w="75%" />
      </Stack>
    </div>
  </Card>
);

export default EventCard;
