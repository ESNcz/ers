"use client";

import {
  useAddOrganizationMembers,
  useDeleteOrganizationMembers,
  useGetAllUsers,
  useGetCurrentUser,
  useGetOrganisationById,
  useGetOrganizationJoinRequests,
  useOrganizationMembers,
  useTransferManager,
} from "@/utils/api";
import { OrganizationJoinRequestStatus, OrganizationMember, UserRole } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { DataTable } from "@components/data-table";
import {
  OrganizationMemberListColumns,
  organizationMemberFacetedFilters,
  organizationMemberGlobalFilterFn,
} from "@components/data-table/organization-member-list-columns";
import { Badge, Button, Flex, Group, Stack, Title } from "@mantine/core";
import { IconMailForward } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo } from "react";

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

  const { data: joinRequests } = useGetOrganizationJoinRequests(organizationId, {
    query: { enabled: isUserManager },
  });

  const pendingCount = useMemo(
    () => joinRequests?.filter((r) => r.status === OrganizationJoinRequestStatus.pending).length ?? 0,
    [joinRequests],
  );

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

  const handleDeleteOrganizationMembers = (member: OrganizationMember) => {
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
  };

  const handleAddMemberToOrganization = (userId: string) => {
    addOrganizationMemberMutation.mutate({
      id: organizationId,
      data: {
        userIds: [userId],
      },
    });
  };

  const transferOrganisationManagerMutation = useTransferManager({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });

  const handleTransferSectionManager = (organisationId: string, userId: string) => {
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
  };

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
    return OrganizationMemberListColumns(
      currentUser.id,
      currentOrganisation,
      handleTransferSectionManager,
      handleDeleteOrganizationMembers,
      deleteOrganizationMemberMutation.isPending,
      isUserManager,
      isUserManager ? handleAddMemberToOrganization : undefined,
      memberUserIds,
    );
  }, [currentUser, currentOrganisation, handleTransferSectionManager, handleDeleteOrganizationMembers, deleteOrganizationMemberMutation.isPending, isUserManager, handleAddMemberToOrganization, memberUserIds]);

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
        <Flex gap={16}>
          {isUserManager && (
            <Button
              component={Link}
              href={routes.ORGANISATION_JOIN_REQUESTS({ id: organizationId })}
              leftSection={<IconMailForward />}
            >
              Manage Requests {pendingCount > 0 && `(${pendingCount})`}
            </Button>
          )}
          <Title order={2}>{currentOrganisation?.name}</Title>
        </Flex>
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
