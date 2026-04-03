import { type EventApplicationDetailedWithApplications } from "@/utils/api.schemas";
import { dateWithTime } from "@/utils/time";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { ActionIcon, ComboboxData, Flex, Select, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

export const ApplicationManagementColumns = (
  spots: ComboboxData,
  handleChangeApplicationSpot: (applicationId: number, spotId: number | null) => void,
  handleEditApplication: (application: EventApplicationDetailedWithApplications) => void,
  handleDeleteApplication: (application: EventApplicationDetailedWithApplications) => void,
): ColumnDef<EventApplicationDetailedWithApplications>[] => [
  {
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    size: 50,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Registered at" />,
    size: 148,
    cell: ({ row }) => dateWithTime(row.original.createdAt),
  },
  {
    id: "name",
    accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="First and Last Name" />,
    size: 148,
  },
  {
    id: "section",
    accessorFn: (row) => row.organization?.name ?? row.customOrganization?.name ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
    size: 148,
  },
  {
    id: "country",
    accessorFn: (row) => row.organization?.address?.country ?? row.customOrganization?.country ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    size: 148,
  },
  {
    id: "currentSpot",
    accessorFn: (row) =>
      row.spotType ? `${row.spotType.name} - ${row.spotType.price} ${row.spotType.currency}` : "N/A",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Current Spot" />,
    size: 224,
  },
  {
    id: "changeSpot",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Change Spot" />,
    size: 224,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Select
        defaultValue={row.original.spotType?.id ? row.original.spotType.id.toString() : null}
        data={spots}
        searchable
        nothingFoundMessage="Nothing found..."
        allowDeselect
        onChange={(value) => {
          handleChangeApplicationSpot(row.original.id, value === null ? null : Number(value));
        }}
      />
    ),
  },
  {
    id: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Operations" />,
    size: 148,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Flex justify="space-evenly" gap={16}>
        <Tooltip label="Edit Application">
          <ActionIcon
            variant="subtle"
            color="blue"
            size={48}
            onClick={() => handleEditApplication(row.original)}
          >
            <IconEdit width={32} height={32} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Application">
          <ActionIcon
            variant="subtle"
            size={48}
            color="red"
            onClick={() => handleDeleteApplication(row.original)}
          >
            <IconTrash width={32} height={32} />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
  },
];
