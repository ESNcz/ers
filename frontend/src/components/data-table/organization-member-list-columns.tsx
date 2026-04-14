import { Organization, OrganizationMember } from "@/utils/api.schemas";
import ApiImage from "@components/ApiImage/ApiImage";
import { ActionIcon, Box, Flex, Text, Tooltip } from "@mantine/core";
import { IconCrown, IconUserPlus, IconUserX } from "@tabler/icons-react";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";

import { DataTableColumnHeader } from "./DataTableColumnHeader";
import type { DataTableFacetedFilterConfig } from "./types";

export const organizationMemberGlobalFilterFn: FilterFn<OrganizationMember> = (row, _columnId, filterValue) => {
  const search = (filterValue as string).toLowerCase();
  const { user } = row.original;
  return [
    user.firstName,
    user.lastName,
    `${user.firstName} ${user.lastName}`,
    user.email,
    user.gender,
    user.role?.name,
  ].some((val) => val?.toLowerCase().includes(search));
};

export const organizationMemberFacetedFilters: DataTableFacetedFilterConfig[] = [
  {
    columnId: "gender",
    title: "Gender",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Non-Binary", value: "non-binary" },
      { label: "Prefer Not To Say", value: "prefer-not-to-say" },
    ],
  },
];

export const organizationMemberListColumns = (
  currentUserId: string,
  currentOrganisation: Organization,
  handleTransferSectionManager: (organisationId: string, userId: string) => void,
  handleDeleteOrganizationMembers: (member: OrganizationMember) => void,
  deleteOrganizationMemberMutationIsPending: boolean,
  isUserManager: boolean,
  handleAddMember?: (userId: string) => void,
  memberUserIds?: Set<string>,
): ColumnDef<OrganizationMember>[] => [
  {
    id: "photo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Photo" />,
    size: 64,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Box>
        <ApiImage src={row.original.user.photo?.id} />
      </Box>
    ),
  },
  {
    id: "fullName",
    accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
    size: 148,

    enableHiding: false,
    enableGlobalFilter: true,
    cell: ({ row }) => <Text>{`${row.original.user.firstName} ${row.original.user.lastName}`}</Text>,
  },
  {
    id: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
    size: 148,
    minSize: 148,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const { personalAddress } = row.original.user;
      return personalAddress ? (
        <Flex direction="column" justify="start" align="start" ta="start">
          <Text>{`${personalAddress.street} ${personalAddress.houseNumber}`}</Text>
          <Text>{`${personalAddress.zip} ${personalAddress.city}`}</Text>
          <Text>{personalAddress.country}</Text>
        </Flex>
      ) : (
        <Text>N/A</Text>
      );
    },
  },
  {
    id: "gender",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
    accessorFn: (row) => row.user.gender,
    filterFn: "arrIncludesSome",
    size: 148,
    minSize: 148,
    enableGlobalFilter: true,
    cell: ({ row }) => <Text>{row.original.user.gender}</Text>,
  },
  {
    id: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="E-mail" />,
    accessorFn: (row) => row.user.email,
    size: 148,
    minSize: 148,
    enableGlobalFilter: true,
    cell: ({ row }) => <Text>{row.original.user.email}</Text>,
  },
  {
    id: "role",
    accessorFn: (row) => row.user.role?.name ?? "N/A",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    size: 148,
    cell: ({ row }) => <Text>{row.original.user.role?.name ?? "N/A"}</Text>,
  },
  ...(isUserManager
    ? ([
        {
          id: "operations",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Operations" />,
          size: 200,
          enableSorting: false,
          enableGlobalFilter: false,
          cell: ({ row }) => {
            const member = row.original;
            const isMember = !memberUserIds || memberUserIds.has(member.user.id);

            if (!isMember && handleAddMember) {
              return (
                <Flex justify="flex-start" gap={50}>
                  <Tooltip label="Add to Organization">
                    <ActionIcon
                      variant="subtle"
                      size={48}
                      color="green"
                      onClick={() => handleAddMember(member.user.id)}
                    >
                      <IconUserPlus width={32} height={32} />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
              );
            }

            return (
              <Flex justify="flex-start" gap={50}>
                <Tooltip
                  label={
                    currentOrganisation?.manager?.id === member.user.id
                      ? "This person is section manager"
                      : "Transfer Manager"
                  }
                >
                  <ActionIcon
                    variant="subtle"
                    size={48}
                    color="yellow"
                    onClick={() => handleTransferSectionManager(currentOrganisation.id, member.user.id)}
                    disabled={currentOrganisation?.manager?.id === member.user.id}
                  >
                    <IconCrown width={32} height={32} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  label={member.user.id === currentUserId ? "You cannot remove yourself" : "Remove from Organization"}
                >
                  <ActionIcon
                    variant="subtle"
                    size={48}
                    color="red"
                    disabled={member.user.id === currentUserId}
                    loading={deleteOrganizationMemberMutationIsPending}
                    onClick={() => handleDeleteOrganizationMembers(member)}
                  >
                    <IconUserX width={32} height={32} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
            );
          },
        },
      ] as ColumnDef<OrganizationMember>[])
    : []),
];
