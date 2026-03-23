import { EventSimple } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { extractText } from "@/utils/table-helpers";
import ApiImage from "@components/ApiImage/ApiImage";
import { DataTableFacetedFilterConfig, createColumns } from "@components/data-table";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconEye, IconTrash, IconX } from "@tabler/icons-react";
import Link from "next/link";

export const facetedFilters: DataTableFacetedFilterConfig[] = [
  {
    columnId: "visible",
    title: "Status",
    options: [
      { label: "Published", value: "true", icon: IconCheck },
      { label: "Unpublished", value: "false", icon: IconX },
    ],
  },
];

export const EventManagementColumns = (
  handleDuplicateEvent: (event: EventSimple) => void,
  handleDeleteEvent: (event: EventSimple) => void,
) =>
  createColumns<EventSimple>([
    {
      id: "photo",
      header: "Photo",
      width: 64,
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      render: (event) => <ApiImage src={event.photo?.id} w="100%" h="100%" fit="cover" radius="xs" />,
    },
    {
      accessor: "title",
      header: "Event Name",
      width: 148,
      minWidth: 148,
    },
    {
      id: "shortDescription",
      header: "Short Description",
      enableSorting: false,
      enableGlobalFilter: false,
      render: (event) => (
        <Text size="sm" lineClamp={2}>
          {extractText(event.shortDescription)}
        </Text>
      ),
    },
    {
      accessor: "visible",
      header: "Published?",
      width: 56,
      render: (event) =>
        event.visible ? (
          <Tooltip label="Published">
            <IconCheck color="green" />
          </Tooltip>
        ) : (
          <Tooltip label="Unpublished">
            <IconX color="red" />
          </Tooltip>
        ),
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: "actions",
      header: "Operations",
      width: 200,
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      render: (event) => (
        <Flex justify="space-between" gap={16}>
          <Tooltip label="View Event">
            <ActionIcon component={Link} href={routes.EVENT_DETAIL({ id: event.id })} variant="subtle" size={48}>
              <IconEye width={32} height={32} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Duplicate Event">
            <ActionIcon variant="subtle" color="purple" size={48} onClick={() => handleDuplicateEvent(event)}>
              <IconCopy width={32} height={32} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Event">
            <ActionIcon variant="subtle" size={48} color="red" onClick={() => handleDeleteEvent(event)}>
              <IconTrash width={32} height={32} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      ),
    },
  ]);
