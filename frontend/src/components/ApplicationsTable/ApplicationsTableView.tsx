"use client";

import {
  EventApplicationDetailedWithApplications,
  EventDetail,
  OrganizationMemberWithoutUser,
  User,
} from "@/utils/api.schemas";
import { DataTable } from "@components/data-table";
import { applicationManagementColumns } from "@components/data-table/application-management-columns";
import PriorityListModal from "@components/modals/PriorityListModal/PriorityListModal";
import { Button, Flex, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface ApplicationsTableViewProps {
  eventDetail: EventDetail;
  applications: EventApplicationDetailedWithApplications[];
  userOrganisationMemberships: OrganizationMemberWithoutUser[];
  currentUser: User;
}

const ApplicationsTableView = ({
  eventDetail,
  applications,
  userOrganisationMemberships,
  currentUser,
}: ApplicationsTableViewProps) => {
  const router = useRouter();
  const [isPriorityListOpened, { open: openPriorityList, close: closePriorityList }] = useDisclosure(false);

  const columns = useMemo(() => applicationManagementColumns(), []);

  const isPriorityListEditable = dayjs(eventDetail.priorityListDeadline ?? eventDetail.until).isAfter(dayjs());

  return (
    <>
      <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={16}>
        <Title order={1}>Event Applications for {eventDetail.title}</Title>
        <Button onClick={openPriorityList} color="darkBlue" disabled={!isPriorityListEditable}>
          Priority list
        </Button>
      </Flex>
      <DataTable columns={columns} data={applications} emptyMessage="No applications found." />
      <PriorityListModal
        isOpened={isPriorityListOpened}
        closeModal={closePriorityList}
        eventId={eventDetail.id}
        userOrganisationMemberships={userOrganisationMemberships}
        currentUser={currentUser}
        // Table data comes from the server component - re-run it
        onSuccess={() => router.refresh()}
      />
    </>
  );
};

export default ApplicationsTableView;
