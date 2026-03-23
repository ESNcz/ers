import { RolePermissionsItem, User } from "@/utils/api.schemas";
import { DataTableFacetedFilterConfig, createColumns } from "@components/data-table";
import { ActionIcon, Badge, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconSwitchHorizontal, IconTrash, IconX } from "@tabler/icons-react";

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

export const PeopleManagementColumns = (
  currentUserId: string,
  currentUserPermissions: RolePermissionsItem[],
  handleDeleteUser: (id: string) => void,
  setSelectedUserId: (id: string) => void,
  openChangeRoleModal: () => void,
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
      render: (user) => <Text size="sm">{user.nationality}</Text>,
    },
    {
      accessorFn: (user) => String(user.isVerified),
      id: "isVerified",
      header: "Verified",
      enableSorting: false,
      enableGlobalFilter: false,
      render: (user) => (user.isVerified ? <IconCheck size={14} /> : <IconX size={14} />),
    },
    {
      id: "roleName",
      header: "Role",
      enableSorting: false,
      enableGlobalFilter: false,
      render: (user) => <Text size="sm">{user.role?.name ?? "N/A"}</Text>,
    },
    ...(currentUserPermissions.includes(RolePermissionsItem.userupdateRole) ||
    currentUserPermissions.includes(RolePermissionsItem.userdelete)
      ? [
          {
            id: "operations" as const,
            header: "Operations",
            enableSorting: false,
            enableGlobalFilter: false,
            render: (user: User) => (
              <Flex justify="space-evenly" gap={16}>
                {currentUserPermissions.includes(RolePermissionsItem.userupdateRole) && (
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
                {currentUserPermissions.includes(RolePermissionsItem.userdelete) && (
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
