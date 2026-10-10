import { RolePermissionsItem, User, UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { Flex, Text } from "@mantine/core";
import { IconCheck, IconEdit, IconSwitchHorizontal, IconTrash, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { rowActionsColumn } from "./DataTableRowActions";

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
        rowActionsColumn<User>(
          (user) => [
            {
              label: "Edit user",
              icon: <IconEdit size={16} />,
              hidden: !hasPermission(currentUserRole, RolePermissionsItem.userupdate),
              onClick: () => {
                setSelectedUserId(user.id);
                openEditUserModal();
              },
            },
            {
              label: "Change role",
              icon: <IconSwitchHorizontal size={16} />,
              hidden: !hasPermission(currentUserRole, RolePermissionsItem.userupdateRole),
              onClick: () => {
                setSelectedUserId(user.id);
                openChangeRoleModal();
              },
            },
            {
              label: "Delete user",
              icon: <IconTrash size={16} />,
              color: "red",
              hidden: !hasPermission(currentUserRole, RolePermissionsItem.userdelete),
              disabled: user.id === currentUserId,
              hint: user.id === currentUserId ? "You cannot delete yourself" : undefined,
              onClick: () => handleDeleteUser(user.id),
            },
          ],
          "User operations",
        ),
      ] as ColumnDef<User>[])
    : []),
];
