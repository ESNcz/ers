"use client";

import { useGetCurrentUser, useGetEvent, useGetEventApplications, useUserOrganizationMemberships } from "@/utils/api";
import { isUserManager } from "@/utils/checkPermissions";
import routes from "@/utils/routes";
import { dateWithTime } from "@/utils/time";
import { Flex, ScrollArea, Table, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";

interface ApplicationsTableProps {
  eventId: number;
}

const ApplicationsTable = ({ eventId }: ApplicationsTableProps) => {
  const { data: eventDetail } = useGetEvent(eventId);
  const { data: currentUser } = useGetCurrentUser();
  const { data: userOrganisationMemberships } = useUserOrganizationMemberships(currentUser?.id ?? "", {
    query: {
      enabled: !!currentUser?.id,
    },
  });

  const { data: applicationsList } = useGetEventApplications(eventId);

  const eventApplicationsRows = !applicationsList
    ? []
    : applicationsList?.map((application, index) => (
        <Table.Tr key={`application-${index}-${application.id}`}>
          <Table.Td>{application.priority}</Table.Td>
          <Table.Td>{application.user.firstName + " " + application.user.lastName}</Table.Td>
          <Table.Td>
            {application.organization ? application.organization.name : application.customOrganization?.name}
          </Table.Td>
          <Table.Td>
            {application.organization
              ? application.organization.address.country
              : application.customOrganization?.country}
          </Table.Td>
          <Table.Td>
            {application.spotType
              ? `${application.spotType.name} - ${application.spotType.price} ${application.spotType.currency}`
              : "N/A"}
          </Table.Td>
          <Table.Td>{dateWithTime(application.createdAt)}</Table.Td>
        </Table.Tr>
      ));

  if (!currentUser || !userOrganisationMemberships) return;
  if (!isUserManager(currentUser, userOrganisationMemberships)) redirect(routes.DASHBOARD);

  return (
    <>
      <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={16}>
        <Title order={1}>Event Applications for {eventDetail?.title}</Title>
      </Flex>
      <ScrollArea w="100%">
        {eventApplicationsRows && eventApplicationsRows?.length > 0 ? (
          <Table withTableBorder withColumnBorders withRowBorders striped highlightOnHover={true}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th miw={50}>Priority</Table.Th>
                <Table.Th miw={148}>Full Name</Table.Th>
                <Table.Th miw={148}>Section</Table.Th>
                <Table.Th miw={148}>Country</Table.Th>
                <Table.Th miw={224}>Current Spot</Table.Th>
                <Table.Th miw={148}>Registered at</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{eventApplicationsRows}</Table.Tbody>
          </Table>
        ) : (
          <Text>No applications found.</Text>
        )}
      </ScrollArea>
    </>
  );
};

export default ApplicationsTable;
