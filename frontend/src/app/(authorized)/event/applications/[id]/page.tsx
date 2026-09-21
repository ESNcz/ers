import ApplicationsTable from "@components/ApplicationsTable/ApplicationsTable";
import { Container, Skeleton, Stack } from "@mantine/core";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ManageEventApplicationsProps {
  params: Promise<{ id: string }>;
}

const EventApplications = async ({ params }: ManageEventApplicationsProps) => {
  const { id } = await params;
  const parsedId = Number.parseInt(id);
  if (Number.isNaN(parsedId)) notFound();

  return (
    <Container size="xl">
      <Stack>
        <Suspense
          fallback={
            <Stack aria-busy="true" aria-label="Loading applications">
              <Skeleton height={40} width="50%" />
              <Skeleton height={320} />
            </Stack>
          }
        >
          <ApplicationsTable eventId={parsedId} />
        </Suspense>
      </Stack>
    </Container>
  );
};

export default EventApplications;
