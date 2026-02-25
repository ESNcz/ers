"use client";

import { useGetCurrentUser, useUserOrganizationMemberships } from "@/utils/api";
import routes from "@/utils/routes";
import AddressCodeBlock from "@components/AddressCodeBlock/AddressCodeBlock";
import { Badge, Button, Card, Container, Grid, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";

interface UseFetchAllEventsProps {}

const MyOrganisationsPage = ({}: UseFetchAllEventsProps) => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: userMemberships } = useUserOrganizationMemberships(currentUser?.id ?? "");

  if (!currentUser && !userMemberships) return null;

  return (
    <Container size="xl">
      <Grid>
        {userMemberships && userMemberships?.length > 0 ? (
          userMemberships?.map((membership, index) => {
            return (
              <Grid.Col key={`organisation-${index}-${membership.organization.id}`} span={{ base: 12, xs: 6, sm: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack mt="md" mb="xs" gap={8}>
                    <Text fw={700}>{membership.organization.name}</Text>
                    <Group justify="space-between">
                      <Badge color="pink">CIN: {membership.organization.cin}</Badge>
                      <Badge color="pink">VATIN: {membership.organization.vatin}</Badge>
                    </Group>
                  </Stack>

                  <AddressCodeBlock address={membership.organization.address} />

                  <Button
                    component={Link}
                    href={routes.MANAGE_ORGANISATION_DETAIL({ id: membership.organization.id })}
                    color="blue"
                    fullWidth
                    mt="md"
                    radius="md"
                  >
                    Organisation Members
                  </Button>
                </Card>
              </Grid.Col>
            );
          })
        ) : (
          <Text>No organization memberships found.</Text>
        )}
      </Grid>
    </Container>
  );
};

export default MyOrganisationsPage;
