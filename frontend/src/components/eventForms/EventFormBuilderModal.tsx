import { useCreateEventForm, useUpdateEventForm } from "@/utils/api";
import { CreateEventForm, EventFormManageItem, FormFieldDefinition, FormFieldType } from "@/utils/api.schemas";
import { END_OF_DAY_TIME } from "@/utils/time";
import Modal from "@components/Modal/Modal";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconAlertTriangle, IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";

import { isSelectType } from "./eventFormUtils";

const MAX_FIELDS = 50;

const FIELD_TYPE_OPTIONS = [
  { value: FormFieldType.shortText, label: "Short text" },
  { value: FormFieldType.longText, label: "Long text" },
  { value: FormFieldType.number, label: "Number" },
  { value: FormFieldType.singleSelect, label: "Single select" },
  { value: FormFieldType.multiSelect, label: "Multi select" },
  { value: FormFieldType.checkbox, label: "Checkbox" },
];

interface BuilderValues {
  name: string;
  description: string;
  required: boolean;
  deadline: string | null;
  fields: FormFieldDefinition[];
}

// Field IDs must never be reused - answers are keyed by them
const newField = (): FormFieldDefinition => ({
  id: crypto.randomUUID(),
  type: FormFieldType.shortText,
  label: "",
  description: "",
  required: false,
  options: [],
});

interface EventFormBuilderModalProps {
  eventId: number;
  /** `null` creates a new form */
  eventForm: EventFormManageItem | null;
  hasResponses: boolean;
  isOpened: boolean;
  closeModal: () => void;
  onSaved: () => void;
}

const EventFormBuilderModal = ({
  eventId,
  eventForm,
  hasResponses,
  isOpened,
  closeModal,
  onSaved,
}: EventFormBuilderModalProps) => {
  const form = useForm<BuilderValues>({
    initialValues: {
      name: eventForm?.name ?? "",
      description: eventForm?.description ?? "",
      required: eventForm?.required ?? false,
      deadline: eventForm?.deadline ?? null,
      fields: eventForm?.fields.map((field) => ({
        ...field,
        description: field.description ?? "",
        options: field.options ?? [],
      })) ?? [newField()],
    },
    validate: {
      name: (value) => (value.trim() === "" ? "Name is required" : null),
      deadline: (value) => (value ? null : "Deadline is required"),
      fields: {
        label: (value) => (value.trim() === "" ? "Label is required" : null),
        options: (value, values, path) => {
          const field = values.fields[Number(path.split(".")[1])];
          if (!field || !isSelectType(field.type)) return null;
          return (value ?? []).length === 0 ? "Add at least one option" : null;
        },
      },
    },
  });

  // Notifications come from the global MutationCache in Providers
  const onMutationSuccess = () => {
    onSaved();
    closeModal();
  };
  const createForm = useCreateEventForm({ mutation: { onSuccess: onMutationSuccess } });
  const updateForm = useUpdateEventForm({ mutation: { onSuccess: onMutationSuccess } });

  const handleSubmit = form.onSubmit((values) => {
    if (values.fields.length === 0) {
      form.setFieldError("fields", "Add at least one field");
      return;
    }

    const data: CreateEventForm = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      required: values.required,
      deadline: dayjs(values.deadline).toISOString(),
      fields: values.fields.map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label.trim(),
        ...(field.description?.trim() ? { description: field.description.trim() } : {}),
        required: field.required,
        ...(isSelectType(field.type) ? { options: field.options } : {}),
      })),
    };

    if (eventForm) updateForm.mutate({ eventId, formId: eventForm.id, data });
    else createForm.mutate({ eventId, data });
  });

  return (
    <Modal size="xl" opened={isOpened} onClose={closeModal} title={eventForm ? `Edit "${eventForm.name}"` : "New form"}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {hasResponses && (
            <Alert color="yellow" icon={<IconAlertTriangle />}>
              Existing answers are kept. New required fields mark responses incomplete. Changing a field's type
              invalidates its answers.
            </Alert>
          )}

          <TextInput label="Name" withAsterisk maxLength={200} {...form.getInputProps("name")} />
          <Textarea label="Description" autosize minRows={2} maxLength={1000} {...form.getInputProps("description")} />
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <DateTimePicker
              label="Deadline"
              withAsterisk
              defaultTimeValue={END_OF_DAY_TIME}
              value={form.values.deadline ? dayjs(form.values.deadline).toDate() : null}
              onChange={(value) => form.setFieldValue("deadline", value ? dayjs(value).toISOString() : null)}
              error={form.errors.deadline}
              timePickerProps={{ withDropdown: true }}
            />
            <Switch
              mt={{ base: 0, sm: 30 }}
              label="Required form"
              description="Shown as required to applicants, nothing is blocked when not filled"
              {...form.getInputProps("required", { type: "checkbox" })}
            />
          </SimpleGrid>

          <Text fw={600}>Fields</Text>
          {form.values.fields.map((field, index) => (
            <Card key={field.id} withBorder padding="sm" radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    Field {index + 1}
                  </Text>
                  <Group gap={4}>
                    <ActionIcon
                      variant="subtle"
                      aria-label="Move field up"
                      disabled={index === 0}
                      onClick={() => form.reorderListItem("fields", { from: index, to: index - 1 })}
                    >
                      <IconArrowUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      aria-label="Move field down"
                      disabled={index === form.values.fields.length - 1}
                      onClick={() => form.reorderListItem("fields", { from: index, to: index + 1 })}
                    >
                      <IconArrowDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="Remove field"
                      onClick={() => form.removeListItem("fields", index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select
                    label="Type"
                    data={FIELD_TYPE_OPTIONS}
                    allowDeselect={false}
                    {...form.getInputProps(`fields.${index}.type`)}
                  />
                  <TextInput
                    label="Label"
                    withAsterisk
                    maxLength={200}
                    {...form.getInputProps(`fields.${index}.label`)}
                  />
                </SimpleGrid>
                <TextInput
                  label="Description"
                  placeholder="Optional help text"
                  maxLength={1000}
                  {...form.getInputProps(`fields.${index}.description`)}
                />
                {isSelectType(field.type) && (
                  <TagsInput
                    label="Options"
                    description="Press Enter after each option"
                    withAsterisk
                    maxTags={50}
                    {...form.getInputProps(`fields.${index}.options`)}
                  />
                )}
                <Switch label="Required" {...form.getInputProps(`fields.${index}.required`, { type: "checkbox" })} />
              </Stack>
            </Card>
          ))}
          {form.errors.fields && (
            <Text c="red" size="sm">
              {form.errors.fields}
            </Text>
          )}
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => form.insertListItem("fields", newField())}
            disabled={form.values.fields.length >= MAX_FIELDS}
          >
            Add field
          </Button>

          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={createForm.isPending || updateForm.isPending}>
              {eventForm ? "Save changes" : "Create form"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EventFormBuilderModal;
