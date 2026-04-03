import { RolePermissionsItem, User, UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import type { DataTableFacetedFilterConfig } from "./types";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconEdit, IconSwitchHorizontal, IconTrash, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

export const peopleManagementFacetedFilters: DataTableFacetedFilterConfig[] = [
  {
    columnId: "isVerified",
    title: "Status",
    options: [
      { label: "Verified", value: "true", icon: IconCheck },
      { label: "Not Verified", value: "false", icon: IconX },
    ],
  },
];

const hasPermission = (role: UserRole, permission: RolePermissionsItem) => hasSomePermissions(role, [permission]);

export const PeopleManagementColumns = (
  currentUserId: string,
  currentUserRole: UserRole,
  handleDeleteUser: (id: string) => void,
  setSelectedUserId: (id: string) => void,
  openChangeRoleModal: () => void,
  openEditUserModal: () => void,
): ColumnDef<User>[] => [
  {
    accessorKey: "firstName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.firstName}
      </Text>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.lastName}
      </Text>
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    enableSorting: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.username}
      </Text>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    enableSorting: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.email}
      </Text>
    ),
  },
  {
    id: "birthDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Birth Date" />,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Text size="sm">{row.original.birthDate ? dayjs(row.original.birthDate).format("DD/MM/YYYY") : "N/A"}</Text>
    ),
  },
  {
    accessorKey: "nationality",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nationality" />,
    enableSorting: false,
    cell: ({ row }) => (
      <Flex justify="center">
        <Text size="sm">{row.original.nationality}</Text>
      </Flex>
    ),
  },
  {
    id: "isVerified",
    accessorFn: (row) => String(row.isVerified),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Verified" />,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.isVerified ? (
        <Flex justify="center">
          <IconCheck color="green" />
        </Flex>
      ) : (
        <Flex justify="center">
          <IconX color="red" />
        </Flex>
      ),
  },
  {
    id: "roleName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Flex justify="start">
        <Text size="sm">{row.original.role?.name ?? "N/A"}</Text>
      </Flex>
    ),
  },
  ...(hasPermission(currentUserRole, RolePermissionsItem.userupdateRole) ||
  hasPermission(currentUserRole, RolePermissionsItem.userdelete) ||
  hasPermission(currentUserRole, RolePermissionsItem.userupdate)
    ? ([
        {
          id: "operations",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Operations" />,
          enableSorting: false,
          enableGlobalFilter: false,
          cell: ({ row }) => (
            <Flex justify="flex-start" gap={16}>
              {hasPermission(currentUserRole, RolePermissionsItem.userupdate) && (
                <Tooltip label="Edit User">
                  <ActionIcon
                    variant="subtle"
                    size={48}
                    color="green"
                    onClick={() => {
                      setSelectedUserId(row.original.id);
                      openEditUserModal();
                    }}
                  >
                    <IconEdit width={32} height={32} />
                  </ActionIcon>
                </Tooltip>
              )}
              {hasPermission(currentUserRole, RolePermissionsItem.userupdateRole) && (
                <Tooltip label="Change Role">
                  <ActionIcon
                    variant="subtle"
                    size={48}
                    color="blue"
                    onClick={() => {
                      setSelectedUserId(row.original.id);
                      openChangeRoleModal();
                    }}
                  >
                    <IconSwitchHorizontal width={32} height={32} />
                  </ActionIcon>
                </Tooltip>
              )}
              {hasPermission(currentUserRole, RolePermissionsItem.userdelete) && (
                <Tooltip label={row.original.id === currentUserId ? "You cannot delete yourself" : "Delete User"}>
                  <ActionIcon
                    variant="subtle"
                    size={48}
                    color="red"
                    disabled={row.original.id === currentUserId}
                    onClick={() => handleDeleteUser(row.original.id)}
                  >
                    <IconTrash width={32} height={32} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Flex>
          ),
        },
      ] as ColumnDef<User>[])
    : []),
];
