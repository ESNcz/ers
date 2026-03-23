"use client";

import { useDeleteEvent, useDuplicateEvent, useGetManagementEvents } from "@/utils/api";
import { EventSimple } from "@/utils/api.schemas";
import { DataTable } from "@components/data-table";
import { EventManagementColumns, facetedFilters } from "@components/data-table/event-management-columns";
import CreateEventModal from "@components/modals/CreateEventModal/CreateEventModal";
import { Button, Container, Flex, ScrollArea, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

const ManageEventsPage = () => {
  const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);

  const duplicateEventMutation = useDuplicateEvent({
    mutation: {
      onSuccess: () => {
        refetchManagementEvents();
      },
    },
  });

  const deleteEventMutation = useDeleteEvent({
    mutation: {
      onSuccess: () => {
        refetchManagementEvents();
      },
    },
  });

  const { data: eventList, refetch: refetchManagementEvents } = useGetManagementEvents();

  const handleDuplicateEvent = (event: EventSimple) => {
    duplicateEventMutation.mutate({ id: event.id });
  };

  const handleDeleteEvent = (event: EventSimple) => {
    if (!confirm(`Do you really want to delete event "${event.title}"?`)) return;
    deleteEventMutation.mutate({ eventId: event.id });
  };

  const events = eventList?.data || [];
  const columns = EventManagementColumns(handleDuplicateEvent, handleDeleteEvent);

  return (
    <Container size="xl">
      <Stack>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          w="100%"
          gap={24}
        >
          <Title order={1}>Manage Events</Title>
          <Button onClick={openModal} leftSection={<IconPlus />}>
            Add Event
          </Button>
        </Flex>
        <ScrollArea w="100%">
          <DataTable
            columns={columns}
            data={events}
            emptyMessage="No Events..."
            facetedFilters={facetedFilters}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </ScrollArea>
      </Stack>
      <CreateEventModal onCreateSuccess={refetchManagementEvents} isOpened={isModalOpen} closeModal={closeModal} />
    </Container>
  );
};

export default ManageEventsPage;
