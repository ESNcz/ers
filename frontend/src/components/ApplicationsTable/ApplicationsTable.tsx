"use client";

import { useGetEvent, useGetEventApplications, useUserOrganizationMemberships } from "@/utils/api";
import { isUserManager } from "@/utils/checkPermissions";
import routes from "@/utils/routes";
import { DataTable } from "@components/data-table";
import { applicationManagementColumns } from "@components/data-table/application-management-columns";
import { useCurrentUser } from "@components/providers/CurrentUserProvider";
import { Flex, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import { useMemo } from "react";

interface ApplicationsTableProps {
  eventId: number;
}

const ApplicationsTable = ({ eventId }: ApplicationsTableProps) => {
  const { data: eventDetail } = useGetEvent(eventId);
  const { currentUser } = useCurrentUser();
  const { data: userOrganisationMemberships } = useUserOrganizationMemberships(currentUser?.id ?? "", {
    query: {
      enabled: !!currentUser?.id,
    },
  });

  const { data: applicationsList } = useGetEventApplications(eventId);

  const applications = useMemo(() => applicationsList ?? [], [applicationsList]);
  const columns = useMemo(() => applicationManagementColumns(), []);

  if (!currentUser || !userOrganisationMemberships) return;
  if (!isUserManager(currentUser, userOrganisationMemberships)) redirect(routes.DASHBOARD);

  return (
    <>
      <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={16}>
        <Title order={1}>Event Applications for {eventDetail?.title}</Title>
      </Flex>
      <DataTable columns={columns} data={applications} emptyMessage="No applications found." />
    </>
  );
};

export default ApplicationsTable;
