import { Organization } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash, IconUsersGroup } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { DataTableColumnHeader } from "./DataTableColumnHeader";

export const organisationManagementColumns = (
  handleDeleteOrganization: (organization: Organization) => void,
  setActiveOrganisation: (organization: Organization) => void,
  openUpdateOrganizationModal: () => void,
  deleteOrganizationMutation: { isPending: boolean },
): ColumnDef<Organization>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,

    enableHiding: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={2}>
        {row.original.name}
      </Text>
    ),
  },
  {
    id: "legalName",
    accessorKey: "legalName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Legal Name" />,
    enableHiding: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={2}>
        {row.original.legalName}
      </Text>
    ),
  },
  {
    id: "cin",
    accessorKey: "cin",
    header: ({ column }) => <DataTableColumnHeader column={column} title="CIN" />,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={2}>
        {row.original.cin}
      </Text>
    ),
  },
  {
    id: "vatin",
    accessorKey: "vatin",
    header: ({ column }) => <DataTableColumnHeader column={column} title="VATIN" />,
    cell: ({ row }) => (
      <Flex justify="center">
        <Text size="sm" lineClamp={2}>
          {row.original.vatin}
        </Text>
      </Flex>
    ),
  },
  {
    id: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Flex direction="column" justify="start" align="start">
        <Text>{`${row.original.address.street} ${row.original.address.houseNumber}`}</Text>
        <Text>{`${row.original.address.zip}, ${row.original.address.city}`}</Text>
        <Text>{row.original.address.country}</Text>
      </Flex>
    ),
  },
  {
    id: "managerName",
    accessorFn: (row) => (row.manager ? `${row.manager.firstName} ${row.manager.lastName}` : "N/A"),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Manager's Name" />,
    enableHiding: false,
    cell: ({ row }) =>
      row.original.manager ? (
        <Text>{`${row.original.manager.firstName} ${row.original.manager.lastName}`}</Text>
      ) : (
        <Text>N/A</Text>
      ),
  },
  {
    id: "managerUsername",
    accessorFn: (row) => (row.manager ? row.manager.username : "N/A"),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Manager's Username" />,
    cell: ({ row }) => <Text>{row.original.manager ? row.original.manager.username : "N/A"}</Text>,
  },
  {
    id: "operations",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Operations" />,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Flex justify="space-evenly" gap={16}>
        <Tooltip label="Organization Members">
          <ActionIcon
            component={Link}
            href={routes.ORGANISATION_MEMBERS({ id: row.original.id })}
            variant="subtle"
            size={48}
            color="black"
          >
            <IconUsersGroup width={32} height={32} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Edit Organization">
          <ActionIcon
            variant="subtle"
            size={48}
            color="blue"
            onClick={() => {
              setActiveOrganisation(row.original);
              openUpdateOrganizationModal();
            }}
          >
            <IconEdit width={32} height={32} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Organization">
          <ActionIcon
            variant="subtle"
            size={48}
            color="red"
            onClick={() => handleDeleteOrganization(row.original)}
            loading={deleteOrganizationMutation.isPending}
          >
            <IconTrash width={32} height={32} />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
  },
];
