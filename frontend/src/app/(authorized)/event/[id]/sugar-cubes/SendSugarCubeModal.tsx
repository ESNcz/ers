"use client";

import { useCreateSugarCube, useGetSugarCubesRecipientOptions } from "@/utils/api";
import type { CreateSugarCubeDto } from "@/utils/api.schemas";
import { Box, Button, Checkbox, Group, Modal, Select, Stack, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useMemo } from "react";

interface SendSugarCubeModalProps {
  opened: boolean;
  onClose: () => void;
  eventId: number;
}

const SendSugarCubeModal = ({ opened, onClose, eventId }: SendSugarCubeModalProps) => {
  const { data: recipientOptionsData, isPending: isRecipientOptionsPending } = useGetSugarCubesRecipientOptions(
    eventId,
    {
      query: {
        enabled: opened,
      },
    },
  );

  const recipientOptions = useMemo(() => {
    if (!recipientOptionsData?.grouped) return [];

    return Object.entries(recipientOptionsData.grouped)
      .map(([group, users]) => ({
        group,
        items: users
          .map((user) => ({
            value: user.id.toString(),
            label: `${user.firstName} ${user.lastName}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }, [recipientOptionsData]);
  const form = useForm<CreateSugarCubeDto>({
    initialValues: {
      toUserId: "",
      message: "",
      isAnonymous: false,
    },
    validate: {
      toUserId: (value) => (!value ? "Recipient is required" : null),
      message: (value) => (!value ? "Message is required" : null),
    },
  });

  const createMutation = useCreateSugarCube({
    mutation: {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate({
      eventId,
      data: {
        toUserId: values.toUserId,
        message: values.message,
        isAnonymous: values.isAnonymous,
      },
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Send Sugar Cube" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Recipient"
            placeholder={recipientOptions.length > 0 ? "Select user" : "No users available"}
            data={recipientOptions}
            searchable
            disabled={isRecipientOptionsPending || recipientOptions.length <= 0}
            {...form.getInputProps("toUserId")}
          />
          <Box>
            <Textarea
              label="Message"
              placeholder="Write your note here..."
              rows={5}
              maxLength={700}
              {...form.getInputProps("message")}
            />
            <Text fz={"xs"} c="dimmed" ta={"right"}>
              {form.values.message.length}/700
            </Text>
          </Box>
          <Checkbox label="Send anonymously" {...form.getInputProps("isAnonymous", { type: "checkbox" })} />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Send
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default SendSugarCubeModal;
