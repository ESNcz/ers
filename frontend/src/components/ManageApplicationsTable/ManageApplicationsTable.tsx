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
import { DataTable } from "@components/data-table";
import { applicationManagementColumns } from "@components/data-table/application-management-columns";
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
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconMail, IconPlus, IconTableExport, IconTrash } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";

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

  const [isSpotNotifModalOpen, { open: openSpotNotifModal, close: closeSpotNotifModal }] = useDisclosure(false);
  const [isCreateSpotModalOpen, { open: openCreateSpotModal, close: closeCreateSpotModal }] = useDisclosure(false);
  const [isUpdateSpotModalOpen, { open: openUpdateSpotModal, close: closeUpdateSpotModal }] = useDisclosure(false);

  const [isEditApplicationModalOpen, { open: openEditApplicationModal, close: closeEditApplicationModal }] =
    useDisclosure(false);

  const spots: ComboboxData = useMemo(() => {
    return (
      eventSpotsList?.map((spot) => ({
        value: spot.id.toString(),
        label: `${spot.name} - ${spot.price} CZK`,
      })) ?? []
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

  const handleChangeApplicationSpot = useCallback(
    (applicationId: number, spotId: number | null) => {
      updateApplicationSpotMutation.mutate({
        applicationId,
        data: { spotId },
      });
    },
    [updateApplicationSpotMutation.mutate],
  );

  const deleteApplicationMutation = useDeleteEventApplication({
    mutation: {
      onSuccess: () => {
        refetchEventApplications();
      },
    },
  });

  const handleDeleteSpot = (spot: EventSpotSimple) => {
    if (!confirm(`Do you really want to delete spot "${spot.name} (${spot.price} ${spot.currency})"?`)) return;
    deleteEventSpotMutation.mutate({ id: spot.id });
  };

  const handleDeleteApplication = useCallback(
    (application: EventApplicationDetailedWithApplications) => {
      if (
        !confirm(
          `Do you really want to delete application for user "${application.user.firstName} ${application.user.lastName} (${application.user.username})"?`,
        )
      ) {
        return;
      }
      deleteApplicationMutation.mutate({ id: application.id });
    },
    [deleteApplicationMutation.mutate],
  );

  const handleEditApplication = useCallback(
    (application: EventApplicationDetailedWithApplications) => {
      setCurrentApplication(application);
      openEditApplicationModal();
    },
    [openEditApplicationModal],
  );

  const exportToSheet = useGenerateSheetEventApplication(eventId, {
    request: { responseType: "blob" },
  });

  const exportDataXLSX = () => {
    exportToSheet.refetch().then((response) => {
      downloadFile(response?.data);
    });
  };

  const applications = useMemo(() => applicationsList ?? [], [applicationsList]);

  const columns = useMemo(
    () =>
      applicationManagementColumns({
        spots,
        handleChangeApplicationSpot,
        handleEditApplication,
        handleDeleteApplication,
      }),
    [spots, handleChangeApplicationSpot, handleEditApplication, handleDeleteApplication],
  );

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
                    <ActionIcon variant="subtle" size={32} color="red" onClick={() => handleDeleteSpot(spot)}>
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

      <DataTable columns={columns} data={applications} emptyMessage="No applications found." />

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
