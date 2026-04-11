"use client";

import {
  useDeleteEventApplication,
  useDeleteEventSpot,
  useGenerateSheetEventApplication,
  useGetEventApplications,
  useGetEventSpots,
  useUpdateUserApplicationSpot,
} from "@/utils/api";
import { type EventApplicationDetailedWithApplications, type EventSpotSimple } from "@/utils/api.schemas";
import { downloadFile } from "@/utils/downloadFile";
import { dateWithTime } from "@/utils/time";
import CreateSpotModal from "@components/modals/CreateSpotModal/CreateSpotModal";
import UpdateEventApplicationModal from "@components/modals/UpdateEventApplicationModal/UpdateEventApplicationModal";
import UpdateSpotModal from "@components/modals/UpdateSpotModal/UpdateSpotModal";
import {
  ActionIcon,
  Box,
  Button,
  ComboboxData,
  Divider,
  Flex,
  List,
  ListItem,
  ScrollArea,
  Select,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconPlus, IconTableExport, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";

interface ManageApplicationsTableProps {
  eventId: number;
}

const ManageApplicationsTable = ({ eventId }: ManageApplicationsTableProps) => {
  const { data: eventSpotsList, refetch: refetchEventSpots } = useGetEventSpots(eventId);
  const deleteEventSpotMutation = useDeleteEventSpot({
    mutation: {
      onSuccess: () => {
        refetchEventSpots();
      },
    },
  });

  const { data: applicationsList, refetch: refetchEventApplications } = useGetEventApplications(eventId);

  const [currentSpot, setCurrentSpot] = useState<EventSpotSimple | null>(null);
  const [currentApplication, setCurrentApplication] = useState<EventApplicationDetailedWithApplications | null>(null);

  const [isCreateSpotModalOpen, { open: openCreateSpotModal, close: closeCreateSpotModal }] = useDisclosure(false);
  const [isUpdateSpotModalOpen, { open: openUpdateSpotModal, close: closeUpdateSpotModal }] = useDisclosure(false);

  const [isEditApplicationModalOpen, { open: openEditApplicationModal, close: closeEditApplicationModal }] =
    useDisclosure(false);

  const spots: ComboboxData = useMemo(() => {
    return (
      eventSpotsList?.map((spot) => {
        return {
          value: spot.id.toString(),
          label: `${spot.name} - ${spot.price} CZK`,
        };
      }) ?? []
    );
  }, [eventSpotsList]);

  const handleRefetchApplications = () => {
    refetchEventSpots();
    refetchEventApplications();
  };

  const updateApplicationSpotMutation = useUpdateUserApplicationSpot({
    mutation: {
      onSuccess: () => {
        refetchEventApplications();
        closeCreateSpotModal();
      },
    },
  });

  const handleChangeApplicationSpot = (applicationId: number, spotId: number | null) => {
    updateApplicationSpotMutation.mutate({
      applicationId: applicationId,
      data: {
        spotId: spotId,
      },
    });
  };

  const deleteApplicationMutation = useDeleteEventApplication({
    mutation: {
      onSuccess: () => {
        refetchEventApplications();
      },
    },
  });

  const handleDeleteSpot = (spot: EventSpotSimple) => {
    if (!confirm(`Do you really want to delete spot "${spot.name} (${spot.price} ${spot.currency})"?`)) return;
    deleteEventSpotMutation.mutate({
      id: spot.id,
    });
  };

  const handleDeleteApplication = (application: EventApplicationDetailedWithApplications) => {
    if (
      !confirm(
        `Do you really want to delete application for user "${application.user.firstName} ${application.user.lastName} (${application.user.username})"?`,
      )
    ) {
      return;
    }
    deleteApplicationMutation.mutate({
      id: application.id,
    });
  };

  const exportToSheet = useGenerateSheetEventApplication(eventId, {
    request: {
      responseType: "blob",
    },
  });

  const exportDataXLSX = () => {
    exportToSheet.refetch().then((response) => {
      downloadFile(response?.data);
    });
  };

  const eventApplicationsRows = !applicationsList
    ? []
    : applicationsList?.map((application, index) => (
        <Table.Tr key={`application-${index}-${application.id}`}>
          <Table.Td>{application.priority}</Table.Td>
          <Table.Td>{dateWithTime(application.createdAt)}</Table.Td>
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
          <Table.Td>
            <Select
              defaultValue={application.spotType?.id ? application.spotType.id.toString() : null}
              data={spots}
              searchable
              nothingFoundMessage="Nothing found..."
              allowDeselect
              onChange={(value) => {
                handleChangeApplicationSpot(application.id, value === null ? null : Number(value));
              }}
            />
          </Table.Td>
          <Table.Td>
            <Flex justify="space-evenly" gap={16}>
              <Tooltip label="Edit Application">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size={48}
                  onClick={() => {
                    setCurrentApplication(application);
                    openEditApplicationModal();
                  }}
                >
                  <IconEdit width={32} height={32} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Delete Application">
                <ActionIcon variant="subtle" size={48} color="red" onClick={() => handleDeleteApplication(application)}>
                  <IconTrash width={32} height={32} />
                </ActionIcon>
              </Tooltip>
            </Flex>
          </Table.Td>
        </Table.Tr>
      ));

  return (
    <>
      <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={16}>
        <Title order={1}>Manage Event Applications</Title>
        <Flex gap={16}>
          <Button onClick={exportDataXLSX} leftSection={<IconTableExport />} color="green" variant="outline">
            Export Data
          </Button>
          <Button onClick={openCreateSpotModal} leftSection={<IconPlus />}>
            Add Spot
          </Button>
        </Flex>
      </Flex>
      {eventSpotsList && eventSpotsList?.length > 0 ? (
        <List>
          {eventSpotsList?.map((spot, index) => (
            <ListItem key={`event-spot-${index}-${spot.id}`}>
              <Flex direction="row" justify={{ base: "space-between", sm: "start" }} gap={24} w="100%">
                <Box w={{ base: 200, md: 300 }}>
                  <Text ta="justify">
                    {spot.name} - {spot.price} CZK
                  </Text>
                </Box>
                <Flex direction="row" align="center" gap={8}>
                  <Tooltip label="Edit Spot">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      size={32}
                      onClick={() => {
                        setCurrentSpot(spot);
                        openUpdateSpotModal();
                      }}
                    >
                      <IconEdit width={24} height={24} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete Spot">
                    <ActionIcon
                      variant="subtle"
                      size={32}
                      color="red"
                      onClick={() => {
                        handleDeleteSpot(spot);
                      }}
                    >
                      <IconTrash width={24} height={24} />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
              </Flex>
              <Divider />
            </ListItem>
          ))}
        </List>
      ) : (
        <Text>No spots created.</Text>
      )}

      <ScrollArea w="100%">
        {eventApplicationsRows && eventApplicationsRows?.length > 0 ? (
          <Table withTableBorder withColumnBorders withRowBorders striped highlightOnHover={true}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th miw={50}>Priority</Table.Th>
                <Table.Th miw={148}>Registered at</Table.Th>
                <Table.Th miw={148}>First and Last Name</Table.Th>
                <Table.Th miw={148}>Section</Table.Th>
                <Table.Th miw={148}>Country</Table.Th>
                <Table.Th miw={224}>Current Spot</Table.Th>
                <Table.Th miw={224}>Change Spot</Table.Th>
                <Table.Th miw={148} w={200}>
                  Operations
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{eventApplicationsRows}</Table.Tbody>
          </Table>
        ) : (
          <Text>No applications found.</Text>
        )}
      </ScrollArea>
      {currentApplication ? (
        <UpdateEventApplicationModal
          currentApplication={currentApplication}
          isOpened={isEditApplicationModalOpen}
          handleSuccess={handleRefetchApplications}
          closeModal={closeEditApplicationModal}
        />
      ) : null}
      <CreateSpotModal
        eventId={eventId}
        isOpened={isCreateSpotModalOpen}
        handleSuccess={handleRefetchApplications}
        closeModal={closeCreateSpotModal}
      />
      {currentSpot && (
        <UpdateSpotModal
          currentSpot={currentSpot}
          isOpened={isUpdateSpotModalOpen}
          handleSuccess={handleRefetchApplications}
          closeModal={closeUpdateSpotModal}
        />
      )}
    </>
  );
};

export default ManageApplicationsTable;
