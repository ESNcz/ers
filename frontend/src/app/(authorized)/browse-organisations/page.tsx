"use client";

import {
  useAllOrganizations,
  useGetCurrentUser,
  useUserOrganizationMemberships,
  useCreateJoinRequest,
  useGetMyJoinRequests,
} from "@/utils/api";
import { OrganizationJoinRequestStatus } from "@/utils/api.schemas";
import AddressCodeBlock from "@components/AddressCodeBlock/AddressCodeBlock";
import { Badge, Button, Card, Container, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMemo } from "react";

const BrowseOrganisationsPage = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: organisations } = useAllOrganizations();
  const { data: userMemberships } = useUserOrganizationMemberships(currentUser?.id ?? "");
  const { data: myJoinRequests, refetch: refetchJoinRequests } = useGetMyJoinRequests();

  const memberOrgIds = useMemo(
    () => new Set(userMemberships?.map((m) => m.organization.id) ?? []),
    [userMemberships],
  );

  const pendingRequestOrgIds = useMemo(
    () =>
      new Set(
        myJoinRequests
          ?.filter((r) => r.status === OrganizationJoinRequestStatus.pending)
          .map((r) => r.organization.id) ?? [],
      ),
    [myJoinRequests],
  );

  const createJoinRequestMutation = useCreateJoinRequest({
    mutation: {
      onSuccess: () => {
        refetchJoinRequests();
        notifications.clean();
        notifications.show({
          title: "Request sent",
          message: "Your join request has been sent to the organisation manager.",
          color: "green",
        });
      },
      onError: (error) => {
        notifications.show({
          title: "Error",
          message: (error.response?.data as any)?.message ?? "Failed to send join request.",
          color: "red",
        });
      },
    },
  });

  const handleJoinRequest = (organizationId: string) => {
    createJoinRequestMutation.mutate({ id: organizationId });
  };

  if (!currentUser || !organisations) return null;

  return (
    <Container size="xl">
      <Stack>
        <Title order={1}>Browse Organisations</Title>
        <Grid>
          {organisations.length > 0 ? (
            organisations.map((org) => {
              const isMember = memberOrgIds.has(org.id);
              const hasPendingRequest = pendingRequestOrgIds.has(org.id);

              return (
                <Grid.Col key={org.id} span={{ base: 12, xs: 6, sm: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                    <Stack mt="md" mb="xs" gap={8}>
                      <Text fw={700} size="lg">
                        {org.name}
                      </Text>
                      {org.manager && (
                        <Text size="sm" c="dimmed">
                          Manager: {org.manager.firstName} {org.manager.lastName}
                        </Text>
                      )}
                      <Group>
                        {org.cin && <Badge color="pink">CIN: {org.cin}</Badge>}
                        {org.vatin && <Badge color="pink">VATIN: {org.vatin}</Badge>}
                      </Group>
                    </Stack>

                    <AddressCodeBlock address={org.address} />

                    <Stack mt="md" gap={8}>
                      {isMember ? (
                        <Badge color="green" size="lg" fullWidth>
                          Member
                        </Badge>
                      ) : hasPendingRequest ? (
                        <Badge color="yellow" size="lg" fullWidth>
                          Request Pending
                        </Badge>
                      ) : (
                        <Button
                          color="blue"
                          fullWidth
                          radius="md"
                          onClick={() => handleJoinRequest(org.id)}
                          loading={createJoinRequestMutation.isPending}
                        >
                          Request to Join
                        </Button>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })
          ) : (
            <Grid.Col>
              <Text>No organisations found.</Text>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Container>
  );
};

export default BrowseOrganisationsPage;
