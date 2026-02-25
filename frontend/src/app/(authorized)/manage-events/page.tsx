"use client";

import { useDeleteEvent, useDuplicateEvent, useGetManagementEvents } from "@/utils/api";
import { EventSimple } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import ApiImage from "@components/ApiImage/ApiImage";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import CreateEventModal from "@components/modals/CreateEventModal/CreateEventModal";
import { ActionIcon, Button, Container, Flex, ScrollArea, Stack, Table, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconPlus, IconTrash, IconX, IconZoom } from "@tabler/icons-react";
import Link from "next/link";

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

  const rows = eventList?.data?.map((event, index) => (
    <Table.Tr key={`event-${index}-${event.id}`}>
      <Table.Td p={0}>
        <ApiImage src={event.photo?.id} w="100%" h="100%" fit="cover" />
      </Table.Td>
      <Table.Td>{event.title}</Table.Td>
      <Table.Td>
        <RichTextRenderer content={event.shortDescription} lineClamp={2} />
      </Table.Td>
      <Table.Td>
        {event.visible ? (
          <Tooltip label="Published">
            <IconCheck color="green" />
          </Tooltip>
        ) : (
          <Tooltip label="Unpublished">
            <IconX color="red" />
          </Tooltip>
        )}
      </Table.Td>
      <Table.Td>
        <Flex justify="space-between" gap={16}>
          <Tooltip label="Event Detail">
            <ActionIcon component={Link} href={routes.EVENT_DETAIL({ id: event.id })} variant="subtle" size={48}>
              <IconZoom width={32} height={32} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Duplicate Event">
            <ActionIcon variant="subtle" color="purple" size={48} onClick={() => handleDuplicateEvent(event)}>
              <IconCopy width={32} height={32} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Event">
            {/*TODO - Delete EP*/}
            <ActionIcon variant="subtle" size={48} color="red" onClick={() => handleDeleteEvent(event)}>
              <IconTrash width={32} height={32} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      </Table.Td>
    </Table.Tr>
  ));

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
          {rows && rows.length > 0 ? (
            <Table
              withTableBorder
              withColumnBorders
              withRowBorders
              striped
              highlightOnHover={true}
              style={{ textAlign: "center" }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th h="100%" maw={64} w={64}>
                    Photo
                  </Table.Th>
                  <Table.Th w={148} miw={148}>
                    Event Name
                  </Table.Th>
                  <Table.Th w="60%" h={64}>
                    Short Description
                  </Table.Th>
                  <Table.Th w={56}>Published?</Table.Th>
                  <Table.Th w={200}>Operations</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          ) : (
            <Text>No Events...</Text>
          )}
        </ScrollArea>
      </Stack>
      <CreateEventModal onCreateSuccess={refetchManagementEvents} isOpened={isModalOpen} closeModal={closeModal} />
    </Container>
  );
};

export default ManageEventsPage;
