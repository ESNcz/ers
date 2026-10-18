"use client";

import { useDeleteEventForm, useGetEventFormsForManagement, useReorderEventForms } from "@/utils/api";
import { EventFormManageItem } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { dateWithTime } from "@/utils/time";
import { ActionIcon, Badge, Button, Card, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp, IconEdit, IconPlus, IconTable, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";

import EventFormBuilderModal from "./EventFormBuilderModal";
import EventFormResponsesModal from "./EventFormResponsesModal";

interface ManageEventFormsPanelProps {
  eventId: number;
}

const ManageEventFormsPanel = ({ eventId }: ManageEventFormsPanelProps) => {
  const { data: eventForms, refetch, isLoading, error } = useGetEventFormsForManagement(eventId);
  const [editingForm, setEditingForm] = useState<EventFormManageItem | null>(null);
  const [isBuilderOpened, { open: openBuilder, close: closeBuilder }] = useDisclosure(false);
  const [responsesFormId, setResponsesFormId] = useState<number | null>(null);

  // Notifications come from the global MutationCache in Providers
  const deleteForm = useDeleteEventForm({ mutation: { onSuccess: () => refetch() } });
  const reorderForms = useReorderEventForms({ mutation: { onSuccess: () => refetch() } });

  const handleCreate = () => {
    setEditingForm(null);
    openBuilder();
  };

  const handleEdit = (eventForm: EventFormManageItem) => {
    setEditingForm(eventForm);
    openBuilder();
  };

  const handleDelete = (eventForm: EventFormManageItem) => {
    if (!confirm(`Delete form "${eventForm.name}"? All its responses will be deleted too.`)) return;
    deleteForm.mutate({ eventId, formId: eventForm.id });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    if (!eventForms) return;
    const formIds = eventForms.map((eventForm) => eventForm.id);
    const target = index + direction;
    if (target < 0 || target >= formIds.length) return;
    [formIds[index], formIds[target]] = [formIds[target], formIds[index]];
    reorderForms.mutate({ eventId, data: { formIds } });
  };

  if (isLoading) return <Skeleton height={200} />;
  if (error?.response?.status === 404) return <Text>Event not found.</Text>;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Additional forms</Title>
        <Group>
          <Button component={Link} href={routes.EVENT_DETAIL({ id: eventId })} variant="default">
            Back to event
          </Button>
          <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
            New form
          </Button>
        </Group>
      </Group>

      {eventForms?.length === 0 && (
        <Text c="dimmed">No forms yet. Applicants will see new forms on the event page.</Text>
      )}

      {eventForms?.map((eventForm, index) => (
        <Card key={eventForm.id} withBorder radius="md" padding="md">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Stack gap={4}>
              <Group gap="xs">
                <Text fw={600}>{eventForm.name}</Text>
                <Badge variant="light" color={eventForm.required ? "red" : "gray"}>
                  {eventForm.required ? "Required" : "Optional"}
                </Badge>
                {dayjs(eventForm.deadline).isBefore(dayjs()) && (
                  <Badge variant="outline" color="gray">
                    Closed
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                Deadline: {dateWithTime(eventForm.deadline)} · {eventForm.fields.length} fields
              </Text>
              <Text size="sm">
                {eventForm.counts.complete} complete · {eventForm.counts.incomplete} incomplete ·{" "}
                {eventForm.counts.missing} not filled
              </Text>
            </Stack>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                aria-label="Move form up"
                disabled={index === 0 || reorderForms.isPending}
                onClick={() => handleMove(index, -1)}
              >
                <IconArrowUp size={18} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                aria-label="Move form down"
                disabled={index === eventForms.length - 1 || reorderForms.isPending}
                onClick={() => handleMove(index, 1)}
              >
                <IconArrowDown size={18} />
              </ActionIcon>
              <Button
                variant="light"
                leftSection={<IconTable size={16} />}
                onClick={() => setResponsesFormId(eventForm.id)}
              >
                Responses
              </Button>
              <Button variant="default" leftSection={<IconEdit size={16} />} onClick={() => handleEdit(eventForm)}>
                Edit
              </Button>
              <ActionIcon variant="subtle" color="red" aria-label="Delete form" onClick={() => handleDelete(eventForm)}>
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}

      {isBuilderOpened && (
        <EventFormBuilderModal
          key={editingForm?.id ?? "new"}
          eventId={eventId}
          eventForm={editingForm}
          hasResponses={editingForm ? editingForm.counts.complete + editingForm.counts.incomplete > 0 : false}
          isOpened
          closeModal={closeBuilder}
          onSaved={() => refetch()}
        />
      )}

      {responsesFormId !== null && (
        <EventFormResponsesModal
          eventId={eventId}
          formId={responsesFormId}
          isOpened
          closeModal={() => setResponsesFormId(null)}
        />
      )}
    </Stack>
  );
};

export default ManageEventFormsPanel;
