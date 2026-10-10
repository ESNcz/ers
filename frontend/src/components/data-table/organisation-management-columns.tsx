import { Organization } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { Flex, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconUsersGroup } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { rowActionsColumn } from "./DataTableRowActions";

export const organisationManagementColumns = (
  handleDeleteOrganization: (organization: Organization) => void,
  setActiveOrganisation: (organization: Organization) => void,
  openUpdateOrganizationModal: () => void,
  deleteOrganizationMutation: { isPending: boolean },
): ColumnDef<Organization>[] => [
  {
    accessorKey: "name",
    header: "Name",

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
    header: "Legal Name",
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
    header: "CIN",
    cell: ({ row }) => (
      <Text size="sm" lineClamp={2}>
        {row.original.cin}
      </Text>
    ),
  },
  {
    id: "vatin",
    accessorKey: "vatin",
    header: "VATIN",
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
    header: "Address",
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
    header: "Manager's Name",
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
    header: "Manager's Username",
    cell: ({ row }) => <Text>{row.original.manager ? row.original.manager.username : "N/A"}</Text>,
  },
  rowActionsColumn<Organization>(
    (organisation) => [
      {
        label: "Organization members",
        icon: <IconUsersGroup size={16} />,
        href: routes.ORGANISATION_MEMBERS({ id: organisation.id }),
      },
      {
        label: "Edit organization",
        icon: <IconEdit size={16} />,
        onClick: () => {
          setActiveOrganisation(organisation);
          openUpdateOrganizationModal();
        },
      },
      {
        label: "Delete organization",
        icon: <IconTrash size={16} />,
        color: "red",
        disabled: deleteOrganizationMutation.isPending,
        onClick: () => handleDeleteOrganization(organisation),
      },
    ],
    "Organization operations",
  ),
];
