"use client";

import { useGetOrganisationById } from "@/utils/api";
import routes from "@/utils/routes";
import OrganisationJoinRequests from "@components/OrganisationJoinRequests/OrganisationJoinRequests";
import { Button, Container, Group, Stack, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const OrganisationJoinRequestsPage = ({ params }: Props) => {
  const { id: organizationId } = use(params);
  const { data: organisation } = useGetOrganisationById(organizationId);

  return (
    <Container size="xl">
      <Stack>
        <Group>
          <Button
            component={Link}
            href={routes.MANAGE_ORGANISATION_DETAIL({ id: organizationId })}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            size="compact-sm"
          >
            Back to members
          </Button>
        </Group>
        <Title order={1}>{organisation?.name} — Join Requests</Title>
        <OrganisationJoinRequests organizationId={organizationId} />
      </Stack>
    </Container>
  );
};

export default OrganisationJoinRequestsPage;
