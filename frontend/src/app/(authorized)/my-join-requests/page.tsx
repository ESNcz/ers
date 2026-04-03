"use client";

import { useGetMyJoinRequests } from "@/utils/api";
import { OrganizationJoinRequestStatus } from "@/utils/api.schemas";
import { Badge, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  [OrganizationJoinRequestStatus.pending]: "yellow",
  [OrganizationJoinRequestStatus.accepted]: "green",
  [OrganizationJoinRequestStatus.rejected]: "red",
};

const MyJoinRequestsPage = () => {
  const { data: joinRequests } = useGetMyJoinRequests();

  return (
    <Container size="xl">
      <Stack>
        <Title order={1}>My Join Requests</Title>
        {joinRequests && joinRequests.length > 0 ? (
          joinRequests.map((request) => (
            <Card key={request.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" align="center">
                <Stack gap={4}>
                  <Text fw={700} size="lg">
                    {request.organization.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Sent on {dayjs(request.createdAt).format("DD/MM/YYYY")}
                  </Text>
                </Stack>
                <Badge color={statusColors[request.status]} size="lg">
                  {request.status}
                </Badge>
              </Group>
            </Card>
          ))
        ) : (
          <Text>No join requests sent.</Text>
        )}
      </Stack>
    </Container>
  );
};

export default MyJoinRequestsPage;
