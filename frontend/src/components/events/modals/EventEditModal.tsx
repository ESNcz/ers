"use client";

import { useUpdateEvent } from "@/utils/api";
import { EventDetail, type UpdateEvent } from "@/utils/api.schemas";
import Modal from "@components/Modal/Modal";
import RichTextEditor from "@components/Richtext/RichTextEditor";
import LinkTree, { LinkItem } from "@components/events/LinkTree";
import DateInput from "@components/primitives/DateInput";
import { Button, Fieldset, Flex, Group, NumberInput, SimpleGrid, Switch, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Form, useForm } from "@mantine/form";
import dayjs from "dayjs";
import React from "react";

type FormUpdateEvent = Omit<UpdateEvent, "links"> & {
  links: LinkItem[];
};

interface EventEditModalProps {
  eventDetail: EventDetail;
  isOpened: boolean;
  close: () => void;
  handleSuccess?: () => void;
}

const EventEditModal = ({ eventDetail, isOpened, close, handleSuccess = () => {} }: EventEditModalProps) => {
  const form = useForm<FormUpdateEvent>({
    initialValues: {
      title: eventDetail.title,
      visible: eventDetail.visible,
      registrationDeadline: eventDetail.registrationDeadline,
      capacity: eventDetail.capacity,
      shortDescription: eventDetail.shortDescription,
      longDescription: eventDetail.longDescription,
      links: eventDetail.links.map((link) => ({ ...link, customId: crypto.randomUUID() })),
      since: eventDetail.since,
      until: eventDetail.until,
      codeOfConductLink: eventDetail.codeOfConductLink,
      photoPolicyLink: eventDetail.photoPolicyLink,
      termsAndConditionsLink: eventDetail.termsAndConditionsLink,
    },
    validate: {
      until: (value, values) =>
        dayjs(value).isSame(dayjs(values.since)) || dayjs(value).isAfter(dayjs(values.since))
          ? null
          : "Event end must be larger then beginning of an event.",
    },
  });
  const eventUpdateMutation = useUpdateEvent({
    mutation: {
      onSuccess: (data) => {
        form.setInitialValues({
          ...data,
          links: data.links.map(({ name, link, id }) => ({ id, name, link, customId: crypto.randomUUID() })),
        });
        form.reset();
        handleSuccess();
        close();
      },
    },
  });

  const handleEventUpdate = (values: FormUpdateEvent) => {
    eventUpdateMutation.mutate({
      eventId: eventDetail.id,
      data: { ...values, links: values.links.map(({ name, link, id }) => ({ id: id ?? null, name, link })) },
    });
  };

  const isTouchedDirty = form.isTouched() && form.isDirty();

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Modal size="xl" opened={isOpened} onClose={handleClose} title="Edit Event">
      <Form form={form} onSubmit={handleEventUpdate}>
        <Flex direction="column" gap={8}>
          <Switch
            label={form.values.visible ? "Published" : "Unpublished"}
            defaultChecked={form.values.visible}
            size="md"
            {...form.getInputProps("visible")}
          />
          <TextInput label="Title" {...form.getInputProps("title")} />
          <SimpleGrid cols={2}>
            <NumberInput
              label="Capacity"
              defaultValue={0}
              min={0}
              {...form.getInputProps("capacity")}
              error={form.errors.capacity}
            />
            <DateTimePicker
              label="Registration Deadline"
              value={dayjs(form.values.registrationDeadline).toDate()}
              onChange={(value) => {
                value && form.setFieldValue("registrationDeadline", dayjs(value).toISOString());
              }}
              error={form.errors.since}
            />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <DateInput
              label="Date Since"
              value={dayjs(form.values.since).toDate()}
              onChange={(value) => {
                value && form.setFieldValue("since", dayjs(value).toISOString());
              }}
              error={form.errors.since}
            />
            <DateInput
              label="Date Until"
              value={dayjs(form.values.until).toDate()}
              onChange={(value) => {
                value && form.setFieldValue("until", dayjs(value).toISOString());
              }}
              error={form.errors.until}
            />
          </SimpleGrid>
          <RichTextEditor label="Short Description" {...form.getInputProps("shortDescription")} letterLimit={300} />
          <RichTextEditor label="Long Description" {...form.getInputProps("longDescription")} />
        </Flex>
        <Fieldset legend="Link tree" variant="filled" p={16}>
          <LinkTree links={form.values.links ?? []} onChange={(links) => form.setFieldValue("links", links)} />
        </Fieldset>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={eventUpdateMutation.isPending}>
            Save changes
          </Button>
        </Group>
      </Form>
    </Modal>
  );
};

export default EventEditModal;
