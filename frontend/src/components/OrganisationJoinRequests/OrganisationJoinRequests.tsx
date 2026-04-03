"use client";

import { useGetOrganizationJoinRequests, useRespondToJoinRequest } from "@/utils/api";
import { OrganizationJoinRequest, OrganizationJoinRequestStatus, RespondJoinRequestStatus } from "@/utils/api.schemas";
import { ActionIcon, Badge, Button, Card, Grid, Group, Modal, Stack, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCallback, useRef } from "react";

interface OrganisationJoinRequestsProps {
  organizationId: string;
  onRequestProcessed?: () => void;
}

const OrganisationJoinRequests = ({ organizationId, onRequestProcessed }: OrganisationJoinRequestsProps) => {
  const { data: joinRequests, refetch } = useGetOrganizationJoinRequests(organizationId);
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const pendingAction = useRef<{ request: OrganizationJoinRequest; status: RespondJoinRequestStatus } | null>(null);

  const respondMutation = useRespondToJoinRequest({
    mutation: {
      onSuccess: () => {
        closeConfirm();
        pendingAction.current = null;
        refetch();
        onRequestProcessed?.();
        notifications.clean();
        notifications.show({
          title: "Success",
          message: "Join request has been processed.",
          color: "green",
        });
      },
      onError: (error) => {
        closeConfirm();
        pendingAction.current = null;
        notifications.show({
          title: "Error",
          message: (error.response?.data as any)?.message ?? "Failed to process request.",
          color: "red",
        });
      },
    },
  });

  const handleRespond = useCallback(
    (request: OrganizationJoinRequest, status: RespondJoinRequestStatus) => {
      pendingAction.current = { request, status };
      openConfirm();
    },
    [openConfirm],
  );

  const confirmAction = useCallback(() => {
    if (!pendingAction.current) return;
    const { request, status } = pendingAction.current;
    respondMutation.mutate({ requestId: request.id, data: { status } });
  }, [respondMutation]);

  const pendingRequests = joinRequests?.filter((r) => r.status === OrganizationJoinRequestStatus.pending) ?? [];
  const processedRequests = joinRequests?.filter((r) => r.status !== OrganizationJoinRequestStatus.pending) ?? [];

  const actionLabel = pendingAction.current?.status === RespondJoinRequestStatus.accepted ? "accept" : "reject";
  const actionColor = pendingAction.current?.status === RespondJoinRequestStatus.accepted ? "green" : "red";

  if (!joinRequests) return null;

  return (
    <Stack>
      <Title order={3}>Join Requests ({pendingRequests.length} pending)</Title>

      {pendingRequests.length === 0 && processedRequests.length === 0 && (
        <Text c="dimmed">No join requests.</Text>
      )}

      {pendingRequests.length > 0 && (
        <Grid>
          {pendingRequests.map((request) => (
            <Grid.Col key={request.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                <Stack justify="space-between" h="100%" gap={8}>
                  <Stack gap={4}>
                    <Text fw={600}>
                      {request.user.firstName} {request.user.lastName}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {request.user.email}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Stack>
                  <Group gap={8} justify="flex-end">
                    <Tooltip label="Accept">
                      <ActionIcon
                        color="green"
                        variant="filled"
                        size="lg"
                        onClick={() => handleRespond(request, RespondJoinRequestStatus.accepted)}
                      >
                        <IconCheck size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Reject">
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="lg"
                        onClick={() => handleRespond(request, RespondJoinRequestStatus.rejected)}
                      >
                        <IconX size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {processedRequests.length > 0 && (
        <>
          <Title order={4} mt="md">
            Processed Requests
          </Title>
          <Grid>
            {processedRequests.map((request) => (
              <Grid.Col key={request.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="sm" radius="md" withBorder h="100%">
                  <Group justify="space-between" align="center">
                    <Stack gap={2}>
                      <Text fw={600} size="sm">
                        {request.user.firstName} {request.user.lastName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {request.user.email} — {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </Stack>
                    <Badge
                      color={request.status === OrganizationJoinRequestStatus.accepted ? "green" : "red"}
                      size="md"
                    >
                      {request.status}
                    </Badge>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </>
      )}

      <Modal
        opened={confirmOpened}
        onClose={() => {
          if (!respondMutation.isPending) {
            closeConfirm();
            pendingAction.current = null;
          }
        }}
        title={`Confirm ${actionLabel}`}
        centered
      >
        <Stack>
          <Text>
            Do you want to {actionLabel} the join request from{" "}
            <Text span fw={600}>
              {pendingAction.current?.request.user.firstName} {pendingAction.current?.request.user.lastName}
            </Text>
            ?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeConfirm} disabled={respondMutation.isPending}>
              Cancel
            </Button>
            <Button color={actionColor} onClick={confirmAction} loading={respondMutation.isPending}>
              {actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default OrganisationJoinRequests;
