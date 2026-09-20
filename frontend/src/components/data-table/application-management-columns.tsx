import { type EventApplicationDetailedWithApplications } from "@/utils/api.schemas";
import { dateWithTime } from "@/utils/time";
import { ActionIcon, ComboboxData, Flex, Select, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

interface ApplicationManagementColumnsOptions {
  spots?: ComboboxData;
  handleChangeApplicationSpot?: (application: EventApplicationDetailedWithApplications, spotId: number | null) => void;
  handleEditApplication?: (application: EventApplicationDetailedWithApplications) => void;
  handleDeleteApplication?: (application: EventApplicationDetailedWithApplications) => void;
}

export const applicationManagementColumns = (
  options: ApplicationManagementColumnsOptions = {},
): ColumnDef<EventApplicationDetailedWithApplications>[] => {
  const { spots, handleChangeApplicationSpot, handleEditApplication, handleDeleteApplication } = options;

  const columns: ColumnDef<EventApplicationDetailedWithApplications>[] = [
    {
      accessorKey: "priority",
      header: "Priority",
      size: 110,
      meta: { filterVariant: "number" },
    },
    {
      accessorKey: "createdAt",
      header: "Registered at",
      size: 170,
      meta: { filterVariant: "date" },
      cell: ({ row }) => dateWithTime(row.original.createdAt),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
      header: "First and Last Name",
      size: 148,
    },
    {
      id: "section",
      accessorFn: (row) => row.organization?.name ?? row.customOrganization?.name ?? "",
      header: "Section",
      size: 160,
      meta: { filterVariant: "select" },
    },
    {
      id: "country",
      accessorFn: (row) => row.organization?.address?.country ?? row.customOrganization?.country ?? "",
      header: "Country",
      size: 148,
      meta: { filterVariant: "select" },
    },
    {
      id: "currentSpot",
      accessorFn: (row) =>
        row.spotType ? `${row.spotType.name} - ${row.spotType.price} ${row.spotType.currency}` : "N/A",
      header: "Current Spot",
      size: 224,
      meta: { filterVariant: "select" },
    },
  ];

  if (handleChangeApplicationSpot) {
    columns.push({
      id: "changeSpot",
      header: "Change Spot",
      size: 224,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Select
          value={row.original.spotType?.id ? row.original.spotType.id.toString() : null}
          data={spots}
          searchable
          nothingFoundMessage="Nothing found..."
          allowDeselect
          onChange={(value) => {
            handleChangeApplicationSpot(row.original, value === null ? null : Number(value));
          }}
        />
      ),
    });
  }

  if (handleEditApplication || handleDeleteApplication) {
    columns.push({
      id: "actions",
      header: "Operations",
      size: 148,
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Flex justify="space-evenly" gap={16}>
          {handleEditApplication && (
            <Tooltip label="Edit Application">
              <ActionIcon variant="subtle" color="blue" size={48} onClick={() => handleEditApplication(row.original)}>
                <IconEdit width={32} height={32} />
              </ActionIcon>
            </Tooltip>
          )}
          {handleDeleteApplication && (
            <Tooltip label="Delete Application">
              <ActionIcon variant="subtle" size={48} color="red" onClick={() => handleDeleteApplication(row.original)}>
                <IconTrash width={32} height={32} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      ),
    });
  }

  return columns;
};
