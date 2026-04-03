"use client";

import { useDeleteUser, useGenerateSheetUsers, useGetAllUsers, useGetCurrentUser } from "@/utils/api";
import { downloadFile } from "@/utils/downloadFile";
import { DataTable } from "@components/data-table";
import {
  PeopleManagementColumns,
  peopleManagementFacetedFilters,
} from "@components/data-table/people-management-columns";
import ChangeRoleModal from "@components/modals/ChangeRoleModal/ChangeRoleModal";
import CreateRoleModal from "@components/modals/CreateRoleModal/CreateRoleModal";
import EditUserModal from "@components/modals/EditUserModal/EditUserModal";
import { Button, Flex, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTableExport } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";

interface ManagePeopleListProps {}

const ManagePeopleList = ({}: ManagePeopleListProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [isChangeRoleModalOpen, { open: openChangeRoleModal, close: closeChangeRoleModal }] = useDisclosure(false);
  const [isCreateRoleModal, { open: openCreateRoleModal, close: closeCreateRoleModal }] = useDisclosure(false);
  const [isEditUserModalOpen, { open: openEditUserModal, close: closeEditUserModal }] = useDisclosure(false);

  const deleteUserMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        refetchUsers();
      },
    },
  });
  const { data: currentUser, refetch: refetchCurrentUser } = useGetCurrentUser();
  const { data: allUsers, refetch: refetchUsers } = useGetAllUsers({ all: true });

  const exportToSheet = useGenerateSheetUsers({
    request: {
      responseType: "blob",
    },
  });

  const exportDataXLSX = () => {
    exportToSheet.refetch().then((response) => {
      downloadFile(response?.data);
    });
  };

  const handleDeleteUser = useCallback((id: string) => {
    const deleteUser = allUsers?.data?.find((f) => f.id === id);
    if (
      deleteUser &&
      !confirm(
        `Do you really want to delete user "${deleteUser?.firstName} ${deleteUser?.lastName} (${deleteUser?.username})"?`,
      )
    )
      return;
    deleteUserMutation.mutate({ id });
  }, [allUsers?.data, deleteUserMutation]);

  const users = useMemo(() => allUsers?.data ?? [], [allUsers?.data]);

  const columns = useMemo(() => PeopleManagementColumns(
    currentUser?.id ?? "",
    currentUser?.role ?? null,
    handleDeleteUser,
    setSelectedUserId,
    openChangeRoleModal,
    openEditUserModal,
  ), [currentUser?.id, currentUser?.role, handleDeleteUser, setSelectedUserId, openChangeRoleModal, openEditUserModal]);

  if (!currentUser || !allUsers?.data) return null;

  return (
    <Stack>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        w="100%"
        gap={24}
      >
        <Title order={1}>All Users</Title>
        <Flex gap={16}>
          <Button onClick={exportDataXLSX} leftSection={<IconTableExport />} color="green" variant="outline">
            Export Data
          </Button>
          <Button onClick={openCreateRoleModal} leftSection={<IconPlus />}>
            Add Role
          </Button>
        </Flex>
      </Flex>
      <DataTable columns={columns} data={users} facetedFilters={peopleManagementFacetedFilters} />
      {selectedUserId && (
        <ChangeRoleModal
          currentUser={currentUser}
          user={users.find((f) => f.id === selectedUserId)}
          isOpened={isChangeRoleModalOpen}
          closeModal={closeChangeRoleModal}
          handleOnSuccess={() => {
            refetchUsers();
            refetchCurrentUser();
          }}
        />
      )}
      {selectedUserId && (
        <EditUserModal
          user={users.find((f) => f.id === selectedUserId)}
          isOpened={isEditUserModalOpen}
          closeModal={closeEditUserModal}
          handleOnSuccess={() => {
            refetchUsers();
          }}
        />
      )}
      <CreateRoleModal isOpened={isCreateRoleModal} closeModal={closeCreateRoleModal} />
    </Stack>
  );
};

export default ManagePeopleList;
