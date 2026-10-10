import { Organization, OrganizationMember } from "@/utils/api.schemas";
import { genderOptions } from "@/utils/table-helpers";
import ApiImage from "@components/ApiImage/ApiImage";
import { Box, Flex, Text } from "@mantine/core";
import { IconCrown, IconUserPlus, IconUserX } from "@tabler/icons-react";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";

import { rowActionsColumn } from "./DataTableRowActions";

export const organizationMemberListColumns = (
  currentUserId: string,
  currentOrganisation: Organization | null,
  handleTransferSectionManager: (organisationId: string, userId: string) => void,
  handleDeleteOrganizationMembers: (member: OrganizationMember) => void,
  deleteOrganizationMemberMutationIsPending: boolean,
  isUserManager: boolean,
  handleAddMember?: (userId: string) => void,
  memberUserIds?: Set<string>,
): ColumnDef<OrganizationMember>[] => [
  {
    id: "photo",
    header: "Photo",
    maxSize: 84,
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
    header: "Full Name",
    minSize: 148,
    enableHiding: false,
    enableGlobalFilter: true,
    cell: ({ row }) => <Text>{`${row.original.user.firstName} ${row.original.user.lastName}`}</Text>,
  },
  {
    id: "address",
    header: "Address",
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
    header: "Gender",
    accessorFn: (row) => row.user.gender,
    meta: {
      filterVariant: "select",
      filterOptions: genderOptions,
    },
    minSize: 148,
    enableGlobalFilter: true,
    cell: ({ row }) => <Text>{row.original.user.gender}</Text>,
  },
  {
    id: "email",
    header: "E-mail",
    accessorFn: (row) => row.user.email,
    minSize: 220,
    enableGlobalFilter: true,
    cell: ({ row }) => <Text>{row.original.user.email}</Text>,
  },
  {
    id: "role",
    accessorFn: (row) => row.user.role?.name ?? "N/A",
    header: "Role",
    meta: { filterVariant: "select" },
    minSize: 148,
    cell: ({ row }) => <Text>{row.original.user.role?.name ?? "N/A"}</Text>,
  },
  ...(isUserManager
    ? ([
        rowActionsColumn<OrganizationMember>((member) => {
          const isMember = !memberUserIds || memberUserIds.has(member.user.id);
          const isManager = currentOrganisation?.manager?.id === member.user.id;
          const isCurrentUser = member.user.id === currentUserId;

          return [
            {
              label: "Add to organization",
              icon: <IconUserPlus size={16} />,
              color: "green",
              hidden: isMember || !handleAddMember,
              onClick: () => handleAddMember?.(member.user.id),
            },
            {
              label: "Transfer manager",
              icon: <IconCrown size={16} />,
              hidden: !isMember,
              disabled: isManager,
              hint: isManager ? "This person is section manager" : undefined,
              onClick: () => handleTransferSectionManager(currentOrganisation?.id ?? "", member.user.id),
            },
            {
              label: "Remove from organization",
              icon: <IconUserX size={16} />,
              color: "red",
              hidden: !isMember,
              disabled: isCurrentUser || deleteOrganizationMemberMutationIsPending,
              hint: isCurrentUser ? "You cannot remove yourself" : undefined,
              onClick: () => handleDeleteOrganizationMembers(member),
            },
          ];
        }, "Member operations"),
      ] as ColumnDef<OrganizationMember>[])
    : []),
];
