"use client";

import { useGetPushPublicKey, useGetPushRecipients, useSendPush } from "@/utils/api";
import { showErrorNotification } from "@/utils/notifications";
import { Button, Group, MultiSelect, Paper, SegmentedControl, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMemo } from "react";

interface SendPushForm {
  target: "all" | "selected";
  userIds: string[];
  title: string;
  body: string;
  url: string;
}

/**
 * Send a custom push notification, admin only. Recipients are only admins for now (see `PushService.getRecipients`).
 */
const SendPushNotification = () => {
  const { data: publicKeyData } = useGetPushPublicKey();
  const { data: recipients = [], isLoading, refetch } = useGetPushRecipients();

  const form = useForm<SendPushForm>({
    initialValues: { target: "all", userIds: [], title: "", body: "", url: "" },
    validate: {
      title: isNotEmpty("Title is required"),
      userIds: (value, values) => (values.target === "selected" && value.length === 0 ? "Choose recipients" : null),
      url: (value) => (value && !/^\/(?![/\\])/.test(value) ? "Use an app path starting with /, e.g. /account" : null),
    },
  });

  const recipientOptions = useMemo(
    () =>
      recipients.map((recipient) => ({
        value: recipient.id,
        label: `${recipient.firstName} ${recipient.lastName} (${recipient.devices} ${recipient.devices === 1 ? "device" : "devices"})`,
      })),
    [recipients],
  );

  const mutationSendPush = useSendPush({
    mutation: {
      onSuccess: (result) => {
        notifications.show({
          title: "Notification sent",
          message: `${result.recipients} people, ${result.delivered} devices delivered${result.failed ? `, ${result.failed} failed` : ""}.`,
          color: result.failed ? "orange" : undefined,
        });
        // Expired subscriptions were removed
        void refetch();
      },
      onError: (error) => showErrorNotification(error),
    },
  });

  // Push is disabled on the server
  if (!publicKeyData?.publicKey) return null;

  const handleSend = (values: SendPushForm) => {
    mutationSendPush.mutate({
      data: {
        userIds: values.target === "selected" ? values.userIds : undefined,
        title: values.title,
        body: values.body || undefined,
        url: values.url || undefined,
      },
    });
  };

  return (
    <Paper withBorder radius="md" p="md" mt="xl">
      <Text fw={600}>Send push notification</Text>
      <Text size="sm" c="dimmed" mb="sm">
        For testing, only admins with notifications turned on can receive it.
      </Text>
      <form onSubmit={form.onSubmit(handleSend)}>
        <Stack gap="sm">
          <SegmentedControl
            data={[
              { value: "all", label: `Everyone (${recipients.length})` },
              { value: "selected", label: "Selected people" },
            ]}
            key={form.key("target")}
            {...form.getInputProps("target")}
          />
          {form.getValues().target === "selected" && (
            <MultiSelect
              label="Recipients"
              placeholder={isLoading ? "Loading..." : "Choose recipients"}
              data={recipientOptions}
              searchable
              clearable
              nothingFoundMessage="Nobody has notifications turned on"
              key={form.key("userIds")}
              {...form.getInputProps("userIds")}
            />
          )}
          <TextInput
            label="Title"
            withAsterisk
            maxLength={100}
            key={form.key("title")}
            {...form.getInputProps("title")}
          />
          <Textarea
            label="Message"
            autosize
            minRows={2}
            maxLength={300}
            key={form.key("body")}
            {...form.getInputProps("body")}
          />
          <TextInput
            label="Open on click"
            description="App path, home page when empty"
            placeholder="/account"
            key={form.key("url")}
            {...form.getInputProps("url")}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={mutationSendPush.isPending} disabled={recipients.length === 0}>
              Send
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default SendPushNotification;
