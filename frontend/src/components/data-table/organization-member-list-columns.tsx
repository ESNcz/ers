import { Organization, OrganizationMember } from "@/utils/api.schemas";
import ApiImage from "@components/ApiImage/ApiImage";
import { DataTableFacetedFilterConfig, createColumns } from "@components/data-table";
import { ActionIcon, Box, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCrown, IconUserPlus, IconUserX, IconX } from "@tabler/icons-react";
import type { FilterFn } from "@tanstack/react-table";

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

export const OrganizationMemberListColumns = (
  currentUserId: string,
  currentOrganisation: Organization,
  handleTransferSectionManager: (organisationId: string, userId: string) => void,
  handleDeleteOrganizationMembers: (member: OrganizationMember) => void,
  deleteOrganizationMemberMutationIsPending: boolean,
  isUserManager: boolean,
  handleAddMember?: (userId: string) => void,
  memberUserIds?: Set<string>,
) =>
  createColumns<OrganizationMember>([
    {
      id: "photo",
      header: "Photo",
      width: 64,
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      render: (member) => (
        <Box>
          <ApiImage src={member.user.photo?.id} />
        </Box>
      ),
    },
    {
      id: "fullName",
      accessorFn: (member: OrganizationMember) => `${member.user.firstName} ${member.user.lastName}`,
      header: "Full Name",
      width: 148,
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: true,
      render: (member) => <Text>{`${member.user.firstName} ${member.user.lastName}`}</Text>,
    },
    {
      id: "address",
      header: "Address",
      width: 148,
      minWidth: 148,
      enableSorting: false,
      enableGlobalFilter: false,
      render: (member) => {
        const { personalAddress } = member.user;
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
      header: "Gender",
      accessorFn: (member: OrganizationMember) => member.user.gender,
      filterFn: "arrIncludesSome",
      width: 148,
      minWidth: 148,
      enableSorting: false,
      enableGlobalFilter: true,
      render: (member) => (
        // <Flex justify="center">
        <Text>{member.user.gender}</Text>
        // </Flex>
      ),
    },
    {
      id: "email",
      header: "E-mail",
      accessorFn: (member: OrganizationMember) => member.user.email,
      width: 148,
      minWidth: 148,
      enableSorting: false,
      enableGlobalFilter: true,
      render: (member) => <Text>{member.user.email}</Text>,
    },
    {
      id: "role",
      header: "Role",
      width: 148,
      enableSorting: false,
      enableGlobalFilter: true,
      render: (member) => (
        // <Flex justify="center">
        <Text>{member.user.role?.name ?? "N/A"}</Text>
        // </Flex>
      ),
    },
    ...(isUserManager
      ? [
          {
            id: "operations" as const,
            header: "Operations",
            width: 200,
            enableSorting: false,
            enableGlobalFilter: false,
            render: (member: OrganizationMember) => {
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
        ]
      : []),
  ]);
