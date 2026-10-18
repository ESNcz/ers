import { useSubmitEventFormResponse } from "@/utils/api";
import { ApplicantEventForm } from "@/utils/api.schemas";
import { dateWithTime } from "@/utils/time";
import Modal from "@components/Modal/Modal";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

import FormAnswersView from "./FormAnswersView";
import FormFieldInput from "./FormFieldInput";
import FormStatusBadge from "./FormStatusBadge";
import {
  type FormAnswers,
  type FormInputValue,
  toAnswersPayload,
  toInitialValues,
  validateAnswers,
} from "./eventFormUtils";

interface FillEventFormModalProps {
  eventId: number;
  eventForm: ApplicantEventForm;
  isOpened: boolean;
  closeModal: () => void;
  onSaved: () => void;
}

const FillEventFormModal = ({ eventId, eventForm, isOpened, closeModal, onSaved }: FillEventFormModalProps) => {
  const form = useForm<Record<string, FormInputValue>>({
    initialValues: toInitialValues(eventForm.fields, eventForm.response?.answers as FormAnswers | undefined),
    validate: (values) => validateAnswers(eventForm.fields, toAnswersPayload(eventForm.fields, values)),
  });

  // Server refused the save (deadline passed meanwhile) - show the form read-only until the list refetches
  const [isClosedByServer, setIsClosedByServer] = useState(false);
  const isClosed = eventForm.isClosed || isClosedByServer;

  // Notifications come from the global MutationCache in Providers, server messages explain 403/404
  const submitResponse = useSubmitEventFormResponse({
    mutation: {
      onSuccess: () => {
        onSaved();
        closeModal();
      },
      onError: (error) => {
        const status = error.response?.status;
        if (status === 403) {
          setIsClosedByServer(true);
          onSaved();
          return;
        }
        if (status === 404) {
          onSaved();
          closeModal();
          return;
        }
        // Generated error type doesn't know the backend's `fieldErrors` extension
        const fieldErrors = (error.response?.data as { fieldErrors?: Record<string, string> } | undefined)?.fieldErrors;
        if (status === 400 && fieldErrors) form.setErrors(fieldErrors);
      },
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    submitResponse.mutate({
      eventId,
      formId: eventForm.id,
      data: { answers: toAnswersPayload(eventForm.fields, values) },
    });
  });

  return (
    <Modal size="lg" opened={isOpened} onClose={closeModal} title={eventForm.name}>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Deadline: {dateWithTime(eventForm.deadline)}
          </Text>
          <FormStatusBadge status={eventForm.status} required={eventForm.required} isClosed={isClosed} />
        </Group>
        {eventForm.description && (
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {eventForm.description}
          </Text>
        )}

        {isClosed ? (
          eventForm.response ? (
            <FormAnswersView fields={eventForm.fields} answers={eventForm.response.answers as FormAnswers} />
          ) : (
            <Text c="dimmed">Not filled, deadline passed.</Text>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {eventForm.fields.map((field) => (
                <FormFieldInput key={field.id} field={field} form={form} />
              ))}
              <Group justify="flex-end">
                <Button variant="default" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitResponse.isPending}>
                  Save answers
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Stack>
    </Modal>
  );
};

export default FillEventFormModal;
