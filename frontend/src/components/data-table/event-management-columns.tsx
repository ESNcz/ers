import { EventSimple } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import ApiImage from "@components/ApiImage/ApiImage";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import { Flex, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconEye, IconTrash, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { rowActionsColumn } from "./DataTableRowActions";

export const eventManagementColumns = (
  handleDuplicateEvent: (event: EventSimple) => void,
  handleDeleteEvent: (event: EventSimple) => void,
): ColumnDef<EventSimple>[] => [
  {
    id: "photo",
    header: "Photo",
    maxSize: 84,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <ApiImage src={row.original.photo?.id} w="100%" h="100%" fit="cover" radius="xs" />,
  },
  {
    accessorKey: "title",
    header: "Event Name",
    minSize: 148,
  },
  {
    id: "shortDescription",
    header: "Short Description",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <RichTextRenderer content={row.original.shortDescription} textOnly size="sm" lineClamp={2} />,
  },
  {
    accessorKey: "visible",
    header: "Published?",
    minSize: 120,
    meta: {
      filterVariant: "select",
      filterOptions: [
        { value: "true", label: "Published" },
        { value: "false", label: "Unpublished" },
      ],
    },
    cell: ({ row }) =>
      row.original.visible ? (
        <Flex justify="center">
          <Tooltip label="Published">
            <IconCheck color="green" />
          </Tooltip>
        </Flex>
      ) : (
        <Flex justify="center">
          <Tooltip label="Unpublished">
            <IconX color="red" />
          </Tooltip>
        </Flex>
      ),
  },
  rowActionsColumn<EventSimple>(
    (event) => [
      { label: "View event", icon: <IconEye size={16} />, href: routes.EVENT_DETAIL({ id: event.id }) },
      { label: "Duplicate event", icon: <IconCopy size={16} />, onClick: () => handleDuplicateEvent(event) },
      { label: "Delete event", icon: <IconTrash size={16} />, color: "red", onClick: () => handleDeleteEvent(event) },
    ],
    "Event operations",
  ),
];
