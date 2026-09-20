import { EventSimple } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import ApiImage from "@components/ApiImage/ApiImage";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import { ActionIcon, Flex, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconEye, IconTrash, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const eventManagementColumns = (
  handleDuplicateEvent: (event: EventSimple) => void,
  handleDeleteEvent: (event: EventSimple) => void,
): ColumnDef<EventSimple>[] => [
  {
    id: "photo",
    header: "Photo",
    size: 64,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <ApiImage src={row.original.photo?.id} w="100%" h="100%" fit="cover" radius="xs" />,
  },
  {
    accessorKey: "title",
    header: "Event Name",
    size: 148,
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
    size: 120,
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
  {
    id: "actions",
    header: "Operations",
    size: 200,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Flex justify="space-between" gap={16}>
        <Tooltip label="View Event">
          <ActionIcon component={Link} href={routes.EVENT_DETAIL({ id: row.original.id })} variant="subtle" size={48}>
            <IconEye width={32} height={32} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Duplicate Event">
          <ActionIcon variant="subtle" color="purple" size={48} onClick={() => handleDuplicateEvent(row.original)}>
            <IconCopy width={32} height={32} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Event">
          <ActionIcon variant="subtle" size={48} color="red" onClick={() => handleDeleteEvent(row.original)}>
            <IconTrash width={32} height={32} />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
  },
];
