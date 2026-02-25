"use client";

import SendSugarCubeModal from "@/app/(authorized)/event/[id]/sugar-cubes/SendSugarCubeModal";
import {
  useGetCurrentUser,
  useGetEvent,
  useGetReceivedSugarCubes,
  useGetReportedSugarCubes,
  useGetSentSugarCubes,
  useReportSugarCube,
} from "@/utils/api";
import type { SugarCube } from "@/utils/api.schemas";
import { isUserAdmin } from "@/utils/checkPermissions";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFlag, IconPlus, IconSend, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import React from "react";

const SugarCubesPage = () => {
  const params = useParams();
  const eventId = Number(params.id);

  const { data: currentUser } = useGetCurrentUser();
  const { data: eventDetail } = useGetEvent(eventId);
  const { data: receivedCubes, refetch: refetchReceivedCubes } = useGetReceivedSugarCubes(eventId);
  const { data: sentCubes, refetch: refetchSentCubes } = useGetSentSugarCubes(eventId);
  const { data: reportedCubes, refetch: refetchReportedCubes } = useGetReportedSugarCubes(eventId, {
    query: {
      enabled: isUserAdmin(currentUser?.role),
    },
  });

  const [isSendModalOpen, { open: openSendModal, close: closeSendModal }] = useDisclosure(false);

  const refetchSugarCubes = () => {
    refetchReceivedCubes();
    refetchSentCubes();
    refetchReportedCubes();
  };

  const handleCloseSendModal = () => {
    refetchSugarCubes();
    closeSendModal();
  };

  const reportMutation = useReportSugarCube({
    mutation: {
      onSuccess: () => {
        refetchSugarCubes();
      },
    },
  });

  if (!eventDetail || !currentUser) return null;

  // Check if sugar cubes can be sent: start of the event until 3 days after event until
  const eventStart = dayjs(eventDetail.since);
  const sugarCubesDeadline = dayjs(eventDetail.until).add(3, "day");
  const canSend = dayjs().isAfter(eventStart) && dayjs().isBefore(sugarCubesDeadline);

  const handleReportSugarCube = (sugarCube: SugarCube) => {
    if (!confirm("Do you really want to report sugar cube?")) return;
    reportMutation.mutate({ id: sugarCube.id });
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Flex justify="space-between" align="center" wrap={"wrap"} gap={24}>
          <Title order={2}>Sugar Cubes - {eventDetail.title}</Title>
          {canSend && (
            <Button leftSection={<IconPlus size={16} />} onClick={openSendModal} color="blue">
              Send Sugar Cube
            </Button>
          )}
        </Flex>

        {!canSend && (
          <Text c="dimmed" fs="italic">
            Sugar cubes can only be sent from the start of the event and 3 days after it ends.
          </Text>
        )}

        <Tabs defaultValue="received" orientation={"horizontal"}>
          <Tabs.List grow>
            <Tabs.Tab value="received" leftSection={<IconSend size={16} style={{ transform: "rotate(180deg)" }} />}>
              Received
            </Tabs.Tab>
            <Tabs.Tab value="sent" leftSection={<IconSend size={16} />}>
              Sent
            </Tabs.Tab>
            {isUserAdmin(currentUser.role) && (
              <Tabs.Tab value="reported" leftSection={<IconFlag size={16} />} color="red">
                Reported (Admin)
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="received" pt="md">
            <Stack gap="md">
              {receivedCubes?.length === 0 && <Text c="dimmed">You haven't received any sugar cubes yet.</Text>}
              {receivedCubes?.map((cube) => (
                <Card key={cube.id} withBorder shadow="sm">
                  <Stack gap="xs">
                    <Flex justify="space-between" align="flex-start">
                      <Group gap="xs">
                        <IconUser size={16} />
                        <Text fw={500}>
                          {cube.isAnonymous
                            ? "Anonymous"
                            : `${cube.fromUser?.user?.firstName} ${cube.fromUser?.user?.lastName}`}
                          {!cube.isAnonymous && cube.fromUser?.organization && (
                            <Text span c="dimmed" fw={400} fz="sm">
                              {" "}
                              ({cube.fromUser.organization.name})
                            </Text>
                          )}
                        </Text>
                      </Group>
                      {!cube.isReported && (
                        <Tooltip label="Report">
                          <ActionIcon variant="subtle" color="red" onClick={() => handleReportSugarCube(cube)}>
                            <IconFlag size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {cube.isReported && <Badge color="red">Reported</Badge>}
                    </Flex>
                    <Text>{cube.message}</Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="sent" pt="md">
            <Stack gap="md">
              {sentCubes?.length === 0 && <Text c="dimmed">You haven't sent any sugar cubes yet.</Text>}
              {sentCubes?.map((cube) => (
                <Card key={cube.id} withBorder shadow="sm">
                  <Stack gap="xs">
                    <Flex justify="space-between" align="flex-start">
                      <Group gap="xs">
                        <IconUser size={16} />
                        <Text fw={500}>
                          {cube.toUser?.user?.firstName} {cube.toUser?.user?.lastName}
                          {cube.toUser?.organization && (
                            <Text span c="dimmed" fw={400} fz="sm">
                              {" "}
                              ({cube.toUser.organization.name})
                            </Text>
                          )}
                        </Text>
                        {cube.isAnonymous && <Badge variant="dot">Anonymous</Badge>}
                      </Group>
                    </Flex>
                    <Text>{cube.message}</Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          {isUserAdmin(currentUser.role) && (
            <Tabs.Panel value="reported" pt="md">
              <Stack gap="md">
                {reportedCubes?.length === 0 && <Text c="dimmed">No reported sugar cubes for this event.</Text>}
                {reportedCubes?.map((cube) => (
                  <Card key={cube.id} withBorder shadow="sm">
                    <Stack gap="xs">
                      <Flex justify="space-between" align="flex-start">
                        <Group gap="xs">
                          <IconUser size={16} />
                          <Text fw={500}>
                            {cube.fromUser?.user?.firstName} {cube.fromUser?.user?.lastName}
                            {cube.fromUser?.organization && (
                              <Text span c="dimmed" fw={400} fz="sm">
                                {" "}
                                ({cube.fromUser.organization.name})
                              </Text>
                            )}
                          </Text>
                          {cube.isAnonymous && (
                            <Badge variant="dot" size={"sm"}>
                              Sent Anonymously
                            </Badge>
                          )}
                        </Group>
                        <Stack gap={4} justify="end" align="end">
                          <Text size="xs" c="dimmed">
                            {cube.toUser?.user?.firstName} {cube.toUser?.user?.lastName}
                            {cube.toUser?.organization && (
                              <Text span c="dimmed" size={"xs"}>
                                {" "}
                                ({cube.toUser.organization.name})
                              </Text>
                            )}
                          </Text>
                        </Stack>
                      </Flex>
                      <Text>{cube.message}</Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Tabs.Panel>
          )}
        </Tabs>
      </Stack>

      <SendSugarCubeModal opened={isSendModalOpen} onClose={handleCloseSendModal} eventId={eventId} />
    </Container>
  );
};

export default SugarCubesPage;
