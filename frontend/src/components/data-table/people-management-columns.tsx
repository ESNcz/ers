import { RolePermissionsItem, User, UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { DataTableFacetedFilterConfig, createColumns } from "@components/data-table";
import { ActionIcon, Badge, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconEdit, IconSwitchHorizontal, IconTrash, IconX } from "@tabler/icons-react";

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
) =>
  createColumns<User>([
    {
      accessor: "firstName",
      id: "firstName",
      header: "First Name",
      enableSorting: false,
      enableHiding: false,
      render: (user) => (
        <Text size="sm" lineClamp={1}>
          {user.firstName}
        </Text>
      ),
    },
    {
      accessor: "lastName",
      id: "lastName",
      header: "Last Name",
      enableSorting: false,
      enableHiding: false,
      render: (user) => (
        <Text size="sm" lineClamp={1}>
          {user.lastName}
        </Text>
      ),
    },
    {
      accessor: "username",
      id: "username",
      header: "Username",
      enableSorting: false,
      render: (user) => (
        <Text size="sm" lineClamp={1}>
          {user.username}
        </Text>
      ),
    },
    {
      accessor: "email",
      id: "email",
      header: "Email",
      enableSorting: false,
      render: (user) => (
        <Text size="sm" lineClamp={1}>
          {user.email}
        </Text>
      ),
    },
    {
      id: "birthDate",
      header: "Birth Date",
      enableSorting: false,
      enableGlobalFilter: false,
      render: (user) => <Text size="sm">{user.birthDate ?? "N/A"}</Text>,
    },
    {
      accessor: "nationality",
      id: "nationality",
      header: "Nationality",
      enableSorting: false,
      render: (user) => (
        <Flex justify="center">
          <Text size="sm">{user.nationality}</Text>
        </Flex>
      ),
    },
    {
      accessorFn: (user) => String(user.isVerified),
      id: "isVerified",
      header: "Verified",
      enableSorting: false,
      enableGlobalFilter: false,
      render: (user) =>
        user.isVerified ? (
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
      header: "Role",
      enableSorting: false,
      enableGlobalFilter: false,
      render: (user) => (
        <Flex justify="center">
          <Text size="sm">{user.role?.name ?? "N/A"}</Text>,
        </Flex>
      ),
    },
    ...(hasPermission(currentUserRole, RolePermissionsItem.userupdateRole) ||
    hasPermission(currentUserRole, RolePermissionsItem.userdelete) ||
    hasPermission(currentUserRole, RolePermissionsItem.userupdate)
      ? [
          {
            id: "operations" as const,
            header: "Operations",
            enableSorting: false,
            enableGlobalFilter: false,
            render: (user: User) => (
              <Flex justify="space-evenly" gap={16}>
                {hasPermission(currentUserRole, RolePermissionsItem.userupdate) && (
                  <Tooltip label="Edit User">
                    <ActionIcon
                      variant="subtle"
                      size={48}
                      color="green"
                      onClick={() => {
                        setSelectedUserId(user.id);
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
                        setSelectedUserId(user.id);
                        openChangeRoleModal();
                      }}
                    >
                      <IconSwitchHorizontal width={32} height={32} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {hasPermission(currentUserRole, RolePermissionsItem.userdelete) && (
                  <Tooltip label={user.id === currentUserId ? "You cannot delete yourself" : "Delete User"}>
                    <ActionIcon
                      variant="subtle"
                      size={48}
                      color="red"
                      disabled={user.id === currentUserId}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <IconTrash width={32} height={32} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Flex>
            ),
          },
        ]
      : []),
  ]);
