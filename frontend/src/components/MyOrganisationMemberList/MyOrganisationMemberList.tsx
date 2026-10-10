"use client";

import {
  getOrganizationMemberCandidatesQueryKey,
  useAddOrganizationMembers,
  useDeleteOrganizationMembers,
  useGetOrganisationById,
  useOrganizationMembers,
  useTransferManager,
} from "@/utils/api";
import { OrganizationMember, RolePermissionsItem } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { DataTable } from "@components/data-table";
import { organizationMemberListColumns } from "@components/data-table/organization-member-list-columns";
import AddOrganisationMemberModal from "@components/modals/AddOrganisationMemberModal/AddOrganisationMemberModal";
import { useCurrentUser } from "@components/providers/CurrentUserProvider";
import { Button, Flex, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

interface MyOrganisationMemberListProps {
  organizationId: string;
}

const MyOrganisationMemberList = ({ organizationId }: MyOrganisationMemberListProps) => {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const { data: currentOrganisation, refetch: refetchCurrentOrganisation } = useGetOrganisationById(organizationId);
  const { data: organizationMembers, refetch: refetchOrganisationMembers } = useOrganizationMembers(organizationId, {
    all: true,
  });

  const [isAddModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);

  // Same rules as the backend - the organisation manager can do everything, others need the permission
  const permissions = useMemo(() => {
    const isOrganisationManager = currentOrganisation?.manager?.id === currentUser.id;
    const can = (permission: RolePermissionsItem) =>
      isOrganisationManager || hasSomePermissions(currentUser.role, [permission]);

    return {
      canAddMembers: can(RolePermissionsItem.organisationaddUser),
      canRemoveMembers: can(RolePermissionsItem.organisationdeleteUser),
      canTransferManager: can(RolePermissionsItem.organisationupdate),
    };
  }, [currentOrganisation, currentUser]);

  const addOrganizationMemberMutation = useAddOrganizationMembers({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
        // Added user is no longer a candidate, cached searches are stale
        queryClient.invalidateQueries({ queryKey: getOrganizationMemberCandidatesQueryKey(organizationId) });
        closeAddModal();
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
    refetchOrganisationMembers();
  };

  const tableData = useMemo(() => organizationMembers?.data ?? [], [organizationMembers?.data]);

  const columns = useMemo(() => {
    return organizationMemberListColumns(
      currentUser.id,
      currentOrganisation ?? null,
      handleTransferSectionManager,
      handleDeleteOrganizationMembers,
      deleteOrganizationMemberMutation.isPending,
      permissions,
    );
  }, [currentOrganisation, deleteOrganizationMemberMutation.isPending, permissions]);

  if (!organizationMembers?.data) {
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

        <DataTable columns={[]} data={[]} loading />
      </Stack>
    );
  }

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
        <Flex direction={{ base: "column", md: "row" }} gap={10}>
          <Title order={2}>{currentOrganisation?.name}</Title>
          {permissions.canAddMembers && (
            <Button leftSection={<IconUserPlus size={18} />} onClick={openAddModal}>
              Add member
            </Button>
          )}
        </Flex>
      </Flex>
      <DataTable columns={columns} data={tableData} emptyMessage="No members found." />
      {permissions.canAddMembers && (
        <AddOrganisationMemberModal
          isOpened={isAddModalOpened}
          closeModal={closeAddModal}
          organisationId={organizationId}
          onAddMember={handleAddMemberToOrganization}
          isPending={addOrganizationMemberMutation.isPending}
        />
      )}
    </Stack>
  );
};

export default MyOrganisationMemberList;
