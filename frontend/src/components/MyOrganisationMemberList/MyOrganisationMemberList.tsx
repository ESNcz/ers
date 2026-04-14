"use client";

import {
  useAddOrganizationMembers,
  useDeleteOrganizationMembers,
  useGetAllUsers,
  useGetCurrentUser,
  useGetOrganisationById,
  useOrganizationMembers,
  useTransferManager,
} from "@/utils/api";
import { OrganizationMember, UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { DataTable } from "@components/data-table";
import {
  organizationMemberFacetedFilters,
  organizationMemberGlobalFilterFn,
  organizationMemberListColumns,
} from "@components/data-table/organization-member-list-columns";
import { Flex, Stack, Title } from "@mantine/core";
import { useCallback, useMemo } from "react";

interface MyOrganisationMemberListProps {
  organizationId: string;
}

const MyOrganisationMemberList = ({ organizationId }: MyOrganisationMemberListProps) => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: currentOrganisation, refetch: refetchCurrentOrganisation } = useGetOrganisationById(organizationId);
  const { data: organizationMembers, refetch: refetchOrganisationMembers } = useOrganizationMembers(organizationId);

  const { data: allUsersList, refetch: refetchAllUsers } = useGetAllUsers({ all: true });

  const isUserManager = useMemo(() => {
    return (
      currentOrganisation?.manager?.id === currentUser?.id ||
      hasSomePermissions(currentUser?.role as UserRole, ["organisation.deleteUser"])
    );
  }, [currentOrganisation, currentUser]);

  const addOrganizationMemberMutation = useAddOrganizationMembers({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });
  const deleteOrganizationMemberMutation = useDeleteOrganizationMembers({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });

  const memberUserIds = useMemo(
    () => new Set(organizationMembers?.data?.map((m) => m.user.id) ?? []),
    [organizationMembers],
  );

  const nonMemberRows: OrganizationMember[] = useMemo(() => {
    if (!isUserManager || !allUsersList?.data) return [];
    return allUsersList.data
      .filter((user) => !memberUserIds.has(user.id))
      .map((user) => ({ id: `non-member-${user.id}`, user }) as OrganizationMember);
  }, [allUsersList, memberUserIds, isUserManager]);

  const handleDeleteOrganizationMembers = useCallback(
    (member: OrganizationMember) => {
      if (
        !confirm(
          `Do you really want to remove ${member.user.firstName} ${member.user.lastName} (${member.user.username}) from ${currentOrganisation?.name}?`,
        )
      ) {
        return;
      }
      deleteOrganizationMemberMutation.mutate({
        id: organizationId,
        memberId: member.id,
      });
    },
    [deleteOrganizationMemberMutation.mutate],
  );

  const handleAddMemberToOrganization = useCallback(
    (userId: string) => {
      addOrganizationMemberMutation.mutate({
        id: organizationId,
        data: {
          userIds: [userId],
        },
      });
    },
    [addOrganizationMemberMutation.mutate],
  );

  const transferOrganisationManagerMutation = useTransferManager({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });

  const handleTransferSectionManager = useCallback(
    (organisationId: string, userId: string) => {
      const user = organizationMembers?.data?.find((m) => m.user.id === userId)?.user;
      if (
        user &&
        !confirm(
          `Do you really want to transfer organisation manager to ${user.firstName} ${user.lastName} (${user.username})?`,
        )
      ) {
        return;
      }
      transferOrganisationManagerMutation.mutate({
        organisationId,
        userId,
      });
    },
    [transferOrganisationManagerMutation.mutate],
  );

  const refetchOrganisationMembersInfo = () => {
    refetchCurrentOrganisation();
    refetchAllUsers();
    refetchOrganisationMembers();
  };

  const tableData = useMemo(() => {
    const members = organizationMembers?.data ?? [];
    return [...members, ...nonMemberRows];
  }, [organizationMembers?.data, nonMemberRows]);

  const columns = useMemo(() => {
    if (!currentUser || !currentOrganisation) return [];
    return organizationMemberListColumns(
      currentUser.id,
      currentOrganisation,
      handleTransferSectionManager,
      handleDeleteOrganizationMembers,
      deleteOrganizationMemberMutation.isPending,
      isUserManager,
      isUserManager ? handleAddMemberToOrganization : undefined,
      memberUserIds,
    );
  }, [
    currentUser,
    currentOrganisation,
    handleTransferSectionManager,
    handleDeleteOrganizationMembers,
    deleteOrganizationMemberMutation.isPending,
    isUserManager,
    handleAddMemberToOrganization,
    memberUserIds,
  ]);
  if (!currentOrganisation || !currentUser) return null;

  return (
    <Stack>
      <Flex
        w="100%"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={16}
      >
        <Title order={1}>My Organisation</Title>
        <Title order={2}>{currentOrganisation?.name}</Title>
      </Flex>
      <DataTable
        columns={columns}
        data={tableData}
        globalFilterFn={organizationMemberGlobalFilterFn}
        facetedFilters={organizationMemberFacetedFilters}
        emptyMessage="No members found."
      />
    </Stack>
  );
};

export default MyOrganisationMemberList;
