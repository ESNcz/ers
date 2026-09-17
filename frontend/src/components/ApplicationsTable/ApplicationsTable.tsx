"use client";

import { useGetEvent, useGetEventApplications, useUserOrganizationMemberships } from "@/utils/api";
import { isUserManager } from "@/utils/checkPermissions";
import routes from "@/utils/routes";
import { DataTable } from "@components/data-table";
import { applicationManagementColumns } from "@components/data-table/application-management-columns";
import PriorityListModal from "@components/modals/PriorityListModal/PriorityListModal";
import { useCurrentUser } from "@components/providers/CurrentUserProvider";
import { Button, Flex, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
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

  const { data: applicationsList, refetch: refetchApplications } = useGetEventApplications(eventId);
  const [isPriorityListOpened, { open: openPriorityList, close: closePriorityList }] = useDisclosure(false);

  const applications = useMemo(() => applicationsList ?? [], [applicationsList]);
  const columns = useMemo(() => applicationManagementColumns(), []);

  const isPriorityListEditable =
    !!eventDetail && dayjs(eventDetail.priorityListDeadline ?? eventDetail.until).isAfter(dayjs());

  if (!currentUser || !userOrganisationMemberships) return;
  if (!isUserManager(currentUser, userOrganisationMemberships)) redirect(routes.DASHBOARD);

  return (
    <>
      <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={16}>
        <Title order={1}>Event Applications for {eventDetail?.title}</Title>
        <Button onClick={openPriorityList} color="darkBlue" disabled={!isPriorityListEditable}>
          Priority list
        </Button>
      </Flex>
      <DataTable columns={columns} data={applications} emptyMessage="No applications found." />
      <PriorityListModal
        isOpened={isPriorityListOpened}
        closeModal={closePriorityList}
        eventId={eventId}
        userOrganisationMemberships={userOrganisationMemberships}
        currentUser={currentUser}
        onSuccess={refetchApplications}
      />
    </>
  );
};

export default ApplicationsTable;
