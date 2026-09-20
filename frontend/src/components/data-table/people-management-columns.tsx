import { RolePermissionsItem, User, UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconEdit, IconSwitchHorizontal, IconTrash, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

const hasPermission = (role: UserRole, permission: RolePermissionsItem) => hasSomePermissions(role, [permission]);

export const peopleManagementColumns = (
  currentUserId: string,
  currentUserRole: UserRole,
  handleDeleteUser: (id: string) => void,
  setSelectedUserId: (id: string) => void,
  openChangeRoleModal: () => void,
  openEditUserModal: () => void,
): ColumnDef<User>[] => [
  {
    id: "firstName",
    accessorKey: "firstName",
    header: "First Name",
    enableHiding: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.firstName}
      </Text>
    ),
  },
  {
    id: "lastName",
    accessorKey: "lastName",
    header: "Last Name",
    enableHiding: false,
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.lastName}
      </Text>
    ),
  },
  {
    id: "username",
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.username}
      </Text>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <Text size="sm" lineClamp={1}>
        {row.original.email}
      </Text>
    ),
  },
  {
    id: "birthDate",
    accessorFn: (row) => row.birthDate ?? undefined,
    header: "Birth Date",
    sortUndefined: "last",
    meta: { filterVariant: "date" },
    cell: ({ row }) => (
      <Text size="sm">{row.original.birthDate ? dayjs(row.original.birthDate).format("DD/MM/YYYY") : "N/A"}</Text>
    ),
  },
  {
    id: "nationality",
    accessorKey: "nationality",
    header: "Nationality",
    meta: { filterVariant: "select" },
    cell: ({ row }) => (
      <Flex justify="center">
        <Text size="sm">{row.original.nationality}</Text>
      </Flex>
    ),
  },
  {
    id: "isVerified",
    accessorFn: (row) => String(row.isVerified),
    header: "Verified",
    meta: {
      filterVariant: "select",
      filterOptions: [
        { value: "true", label: "Verified" },
        { value: "false", label: "Not verified" },
      ],
    },
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
    accessorFn: (row) => row.role?.name ?? "N/A",
    header: "Role",
    meta: { filterVariant: "select" },
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
          header: "Operations",
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
