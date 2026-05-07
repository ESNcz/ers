import { useRetryNotifySpotAssignment } from "@/utils/api";
import { type NotifySpotAssignmentResponse } from "@/utils/api.schemas";
import { showErrorNotification } from "@/utils/notifications";
import Modal from "@components/Modal/Modal";
import { Accordion, Badge, Button, Flex, Group, List, ListItem, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck, IconClock, IconMailX, IconRefresh } from "@tabler/icons-react";

interface SpotNotificationResultModalProps {
  isOpened: boolean;
  closeModal: () => void;
  eventId: number;
  result: NotifySpotAssignmentResponse | null;
  onResultUpdate: (next: NotifySpotAssignmentResponse) => void;
}

const SpotNotificationResultModal = ({
  isOpened,
  closeModal,
  eventId,
  result,
  onResultUpdate,
}: SpotNotificationResultModalProps) => {
  const retryMutation = useRetryNotifySpotAssignment({
    mutation: {
      onSuccess: (retryResult) => {
        if (!result) return;

        const succeededIds = new Set(retryResult.sent.map((r) => r.applicationId));
        const newlyFailedById = new Map(retryResult.failed.map((f) => [f.applicationId, f]));

        const remainingFailed = result.failed
          .filter((f) => !succeededIds.has(f.applicationId))
          .map((f) => newlyFailedById.get(f.applicationId) ?? f);

        const merged: NotifySpotAssignmentResponse = {
          sent: [...result.sent, ...retryResult.sent],
          failed: remainingFailed,
          skipped: result.skipped,
        };

        onResultUpdate(merged);

        notifications.show({
          title: "Retry completed",
          message: `${retryResult.sent.length} re-sent, ${retryResult.failed.length} still failed.`,
          color: retryResult.failed.length > 0 ? "yellow" : "green",
          autoClose: 5000,
        });
      },
      onError: (error) => {
        showErrorNotification(error as never);
      },
    },
  });

  if (!result) {
    return <Modal size="lg" opened={isOpened} onClose={closeModal} title="Spot assignment notifications" />;
  }

  const sentCount = result.sent.length;
  const failedCount = result.failed.length;
  const skippedCount = result.skipped.length;
  const total = sentCount + failedCount + skippedCount;

  const defaultOpen: string[] = [];
  if (failedCount > 0) defaultOpen.push("failed");
  if (skippedCount > 0) defaultOpen.push("skipped");
  if (defaultOpen.length === 0 && sentCount > 0) defaultOpen.push("sent");

  const handleRetryFailed = () => {
    if (failedCount === 0) return;
    if (
      !confirm(
        `Retry sending the spot assignment email to ${failedCount} failed recipient(s)?`,
      )
    ) {
      return;
    }
    retryMutation.mutate({
      eventId,
      data: { applicationIds: result.failed.map((f) => f.applicationId) },
    });
  };

  return (
    <Modal size="lg" opened={isOpened} onClose={closeModal} title="Spot assignment notifications">
      <Stack gap={16}>
        <Group gap={8} wrap="wrap">
          <Badge color="green" variant="light" size="lg" leftSection={<IconCheck size={14} />}>
            Sent: {sentCount}
          </Badge>
          <Badge color="red" variant="light" size="lg" leftSection={<IconMailX size={14} />}>
            Failed: {failedCount}
          </Badge>
          <Badge color="yellow" variant="light" size="lg" leftSection={<IconClock size={14} />}>
            Skipped: {skippedCount}
          </Badge>
          <Badge color="gray" variant="light" size="lg">
            Total: {total}
          </Badge>
        </Group>

        {total === 0 ? (
          <Text c="dimmed" ta="center" py={16}>
            No applications were processed.
          </Text>
        ) : (
          <Accordion multiple defaultValue={defaultOpen} variant="separated">
            {sentCount > 0 && (
              <Accordion.Item value="sent">
                <Accordion.Control
                  icon={
                    <ThemeIcon color="green" variant="light" size="sm">
                      <IconCheck size={14} />
                    </ThemeIcon>
                  }
                >
                  <Title order={5}>Sent successfully ({sentCount})</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  <List spacing={4} size="sm">
                    {result.sent.map((r) => (
                      <ListItem key={`sent-${r.applicationId}`}>
                        <Text span fw="bold">
                          {r.name}
                        </Text>{" "}
                        <Text span c="dimmed">
                          — {r.email}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            )}

            {failedCount > 0 && (
              <Accordion.Item value="failed">
                <Accordion.Control
                  icon={
                    <ThemeIcon color="red" variant="light" size="sm">
                      <IconAlertTriangle size={14} />
                    </ThemeIcon>
                  }
                >
                  <Title order={5}>Failed ({failedCount})</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  <Flex direction="column" gap={8}>
                    <Text size="sm" c="dimmed">
                      The email could not be delivered. You can retry sending only to these recipients.
                    </Text>
                    <Group>
                      <Button
                        leftSection={<IconRefresh size={16} />}
                        color="red"
                        variant="light"
                        size="xs"
                        onClick={handleRetryFailed}
                        loading={retryMutation.isPending}
                      >
                        Retry failed ({failedCount})
                      </Button>
                    </Group>
                    <List spacing={6} size="sm">
                      {result.failed.map((r) => (
                        <ListItem key={`failed-${r.applicationId}`}>
                          <Flex direction="column">
                            <Text span fw="bold">
                              {r.name}{" "}
                              <Text span c="dimmed" fw="normal">
                                — {r.email}
                              </Text>
                            </Text>
                            <Text span size="xs" c="red">
                              Reason: {r.reason}
                            </Text>
                          </Flex>
                        </ListItem>
                      ))}
                    </List>
                  </Flex>
                </Accordion.Panel>
              </Accordion.Item>
            )}

            {skippedCount > 0 && (
              <Accordion.Item value="skipped">
                <Accordion.Control
                  icon={
                    <ThemeIcon color="yellow" variant="light" size="sm">
                      <IconClock size={14} />
                    </ThemeIcon>
                  }
                >
                  <Title order={5}>Skipped ({skippedCount})</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm" c="dimmed" mb={8}>
                    These participants were not contacted. Assign them a spot or update their email and try again.
                  </Text>
                  <List spacing={6} size="sm">
                    {result.skipped.map((r) => (
                      <ListItem key={`skipped-${r.applicationId}`}>
                        <Text span fw="bold">
                          {r.name}
                        </Text>{" "}
                        <Text span size="xs" c="dimmed">
                          — {r.reason}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            )}
          </Accordion>
        )}

        <Group justify="flex-end" mt={8}>
          <Button onClick={closeModal} variant="default">
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SpotNotificationResultModal;
