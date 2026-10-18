import { type EventApplicationDetailedWithApplications } from "@/utils/api.schemas";
import { dateWithTime } from "@/utils/time";
import { ComboboxData, Select } from "@mantine/core";
import { IconEdit, IconForms, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { rowActionsColumn } from "./DataTableRowActions";

interface ApplicationManagementColumnsOptions {
  spots?: ComboboxData;
  handleChangeApplicationSpot?: (application: EventApplicationDetailedWithApplications, spotId: number | null) => void;
  handleEditApplication?: (application: EventApplicationDetailedWithApplications) => void;
  handleDeleteApplication?: (application: EventApplicationDetailedWithApplications) => void;
  handleViewForms?: (application: EventApplicationDetailedWithApplications) => void;
}

export const applicationManagementColumns = (
  options: ApplicationManagementColumnsOptions = {},
): ColumnDef<EventApplicationDetailedWithApplications>[] => {
  const { spots, handleChangeApplicationSpot, handleEditApplication, handleDeleteApplication, handleViewForms } =
    options;

  const columns: ColumnDef<EventApplicationDetailedWithApplications>[] = [
    {
      accessorKey: "priority",
      header: "Priority",
      minSize: 110,
      meta: { filterVariant: "number" },
    },
    {
      accessorKey: "createdAt",
      header: "Registered at",
      minSize: 170,
      meta: { filterVariant: "date" },
      cell: ({ row }) => dateWithTime(row.original.createdAt),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
      header: "First and Last Name",
      minSize: 148,
    },
    {
      id: "section",
      accessorFn: (row) => row.organization?.name ?? row.customOrganization?.name ?? "",
      header: "Section",
      minSize: 160,
      meta: { filterVariant: "select" },
    },
    {
      id: "country",
      accessorFn: (row) => row.organization?.address?.country ?? row.customOrganization?.country ?? "",
      header: "Country",
      minSize: 148,
      meta: { filterVariant: "select" },
    },
    {
      id: "currentSpot",
      accessorFn: (row) =>
        row.spotType ? `${row.spotType.name} - ${row.spotType.price} ${row.spotType.currency}` : "N/A",
      header: "Current Spot",
      minSize: 224,
      meta: { filterVariant: "select" },
    },
  ];

  if (handleChangeApplicationSpot) {
    columns.push({
      id: "changeSpot",
      header: "Change Spot",
      minSize: 224,
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

  if (handleEditApplication || handleDeleteApplication || handleViewForms) {
    columns.push(
      rowActionsColumn<EventApplicationDetailedWithApplications>(
        (application) => [
          {
            label: "Additional forms",
            icon: <IconForms size={16} />,
            hidden: !handleViewForms,
            onClick: () => handleViewForms?.(application),
          },
          {
            label: "Edit application",
            icon: <IconEdit size={16} />,
            hidden: !handleEditApplication,
            onClick: () => handleEditApplication?.(application),
          },
          {
            label: "Delete application",
            icon: <IconTrash size={16} />,
            color: "red",
            hidden: !handleDeleteApplication,
            onClick: () => handleDeleteApplication?.(application),
          },
        ],
        "Application operations",
      ),
    );
  }

  return columns;
};
