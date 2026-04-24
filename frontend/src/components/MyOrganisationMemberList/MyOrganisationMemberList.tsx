"use client";

import {
  useAddOrganizationMembers,
  useDeleteOrganizationMembers,
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
  organizationMemberListColumns,
} from "@components/data-table/organization-member-list-columns";
import AddOrganisationMemberModal from "@components/modals/AddOrganisationMemberModal/AddOrganisationMemberModal";
import { Button, Flex, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserPlus } from "@tabler/icons-react";
import { useMemo } from "react";

interface MyOrganisationMemberListProps {
  organizationId: string;
}

const MyOrganisationMemberList = ({ organizationId }: MyOrganisationMemberListProps) => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: currentOrganisation, refetch: refetchCurrentOrganisation } = useGetOrganisationById(organizationId);
  const { data: organizationMembers, refetch: refetchOrganisationMembers } = useOrganizationMembers(organizationId);

  const [isAddModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);

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

  const memberUserIds = useMemo(
    () => new Set(organizationMembers?.data?.map((m) => m.user.id) ?? []),
    [organizationMembers],
  );

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
      currentUser?.id ?? "",
      currentOrganisation ?? null,
      handleTransferSectionManager,
      handleDeleteOrganizationMembers,
      deleteOrganizationMemberMutation.isPending,
      isUserManager,
    );
  }, [currentUser?.role, currentOrganisation]);

  if (!currentUser || !organizationMembers?.data) {
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

        <DataTable columns={[]} data={[]} emptyMessage="Loading..." />
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
          {isUserManager && (
            <Button leftSection={<IconUserPlus size={18} />} onClick={openAddModal}>
              Add member
            </Button>
          )}
        </Flex>
      </Flex>
      <DataTable
        columns={columns}
        data={tableData}
        facetedFilters={organizationMemberFacetedFilters}
        emptyMessage="No members found."
      />
      {isUserManager && (
        <AddOrganisationMemberModal
          isOpened={isAddModalOpened}
          closeModal={closeAddModal}
          memberUserIds={memberUserIds}
          onAddMember={handleAddMemberToOrganization}
          isPending={addOrganizationMemberMutation.isPending}
        />
      )}
    </Stack>
  );
};

export default MyOrganisationMemberList;
