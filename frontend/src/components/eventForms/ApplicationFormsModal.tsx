import { useGetApplicationEventForms } from "@/utils/api";
import { EventApplicationDetailedWithApplications } from "@/utils/api.schemas";
import Modal from "@components/Modal/Modal";
import { Divider, Group, Skeleton, Stack, Text, Title } from "@mantine/core";

import FormAnswersView from "./FormAnswersView";
import FormStatusBadge from "./FormStatusBadge";
import type { FormAnswers } from "./eventFormUtils";

interface ApplicationFormsModalProps {
  eventId: number;
  application: EventApplicationDetailedWithApplications;
  isOpened: boolean;
  closeModal: () => void;
}

/** Manager view of one application's answers to all additional forms */
const ApplicationFormsModal = ({ eventId, application, isOpened, closeModal }: ApplicationFormsModalProps) => {
  const { data: eventForms, isLoading } = useGetApplicationEventForms(eventId, application.id);

  return (
    <Modal
      size="lg"
      opened={isOpened}
      onClose={closeModal}
      title={`Additional forms – ${application.user.firstName} ${application.user.lastName}`}
    >
      {isLoading ? (
        <Skeleton height={120} />
      ) : !eventForms || eventForms.length === 0 ? (
        <Text c="dimmed">This event has no additional forms.</Text>
      ) : (
        <Stack gap="md">
          {eventForms.map((eventForm, index) => (
            <Stack key={eventForm.id} gap="xs">
              {index > 0 && <Divider />}
              <Group justify="space-between">
                <Title order={4}>{eventForm.name}</Title>
                <FormStatusBadge
                  status={eventForm.status}
                  required={eventForm.required}
                  isClosed={eventForm.isClosed}
                />
              </Group>
              {eventForm.response ? (
                <FormAnswersView fields={eventForm.fields} answers={eventForm.response.answers as FormAnswers} />
              ) : (
                <Text size="sm" c="dimmed">
                  Not filled
                </Text>
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Modal>
  );
};

export default ApplicationFormsModal;
