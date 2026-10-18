"use client";

import { useGetMyEventForms } from "@/utils/api";
import { EventFormStatus } from "@/utils/api.schemas";
import { dateWithTime } from "@/utils/time";
import { Alert, Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";

import FillEventFormModal from "./FillEventFormModal";
import FormStatusBadge from "./FormStatusBadge";

interface EventFormsSectionProps {
  eventId: number;
}

/** Additional forms of the event for the signed-in applicant */
const EventFormsSection = ({ eventId }: EventFormsSectionProps) => {
  const { data: eventForms, refetch } = useGetMyEventForms(eventId);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  if (!eventForms || eventForms.length === 0) return null;

  const selectedForm = eventForms.find((eventForm) => eventForm.id === selectedFormId) ?? null;
  const pendingRequiredCount = eventForms.filter(
    (eventForm) => eventForm.required && !eventForm.isClosed && eventForm.status !== EventFormStatus.complete,
  ).length;

  return (
    <Stack gap="xs">
      <Title order={4}>Additional forms</Title>
      {pendingRequiredCount > 0 && (
        <Alert color="orange" icon={<IconAlertTriangle />}>
          You have {pendingRequiredCount} required {pendingRequiredCount === 1 ? "form" : "forms"} to fill.
        </Alert>
      )}
      {eventForms.map((eventForm) => (
        <Card
          key={eventForm.id}
          component="button"
          type="button"
          onClick={() => setSelectedFormId(eventForm.id)}
          withBorder
          padding="sm"
          radius="md"
          style={{ textAlign: "left", cursor: "pointer" }}
        >
          <Stack gap={6}>
            <Text fw={600}>{eventForm.name}</Text>
            <Text size="xs" c="dimmed">
              Deadline: {dateWithTime(eventForm.deadline)}
            </Text>
            {/* Own wrapping row - the sidebar is too narrow for badges next to the name */}
            <Group gap={4}>
              <Badge variant="light" color={eventForm.required ? "red" : "gray"}>
                {eventForm.required ? "Required" : "Optional"}
              </Badge>
              <FormStatusBadge status={eventForm.status} required={eventForm.required} isClosed={eventForm.isClosed} />
            </Group>
          </Stack>
        </Card>
      ))}

      {selectedForm && (
        <FillEventFormModal
          key={selectedForm.id}
          eventId={eventId}
          eventForm={selectedForm}
          isOpened
          closeModal={() => setSelectedFormId(null)}
          onSaved={() => refetch()}
        />
      )}
    </Stack>
  );
};

export default EventFormsSection;
