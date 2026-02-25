import {
  getGetAllRolesQueryKey,
  getGetAllUsersQueryKey,
  getGetCurrentUserQueryKey,
  useGetAllRoles,
  useUpdateUserRole,
} from "@/utils/api";
import { User } from "@/utils/api.schemas";
import { groupPermissions } from "@/utils/permissionGrouping";
import Modal from "@components/Modal/Modal";
import Select from "@components/primitives/Select";
import { Box, Button, Divider, SimpleGrid, Stack, Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";

interface MyModalProps {
  currentUser: User;
  user: User | undefined;
  isOpened: boolean;
  closeModal: () => void;
  handleOnSuccess: () => void;
}

const ChangeRoleModal = ({ currentUser, user, isOpened, closeModal, handleOnSuccess }: MyModalProps) => {
  const queryClient = useQueryClient();
  const [newRole, setNewRole] = useState<string | null>(user?.role?.id.toString() ?? null);

  const { data: allRoles } = useGetAllRoles();

  const changeRoleMutation = useUpdateUserRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [getGetAllUsersQueryKey()] });
        queryClient.invalidateQueries({ queryKey: [getGetAllRolesQueryKey()] });
        queryClient.invalidateQueries({ queryKey: [getGetCurrentUserQueryKey()] });
        setNewRole(null);
        handleOnSuccess();
        closeModal();
      },
    },
  });

  const filteredCategoriesRoles = useMemo(() => {
    if (!allRoles) return [];
    const tmp = allRoles.find((f) => f.id === Number(newRole));
    if (!tmp) return [];
    return groupPermissions(tmp.permissions);
  }, [allRoles, newRole]);

  if (!user || !allRoles) return;

  const handleChangeRole = () => {
    changeRoleMutation.mutate({ userId: user.id, roleId: Number(newRole) });
  };

  const handleClose = () => {
    setNewRole(null);
    closeModal();
  };

  return (
    <Modal size="xl" opened={isOpened} onClose={handleClose} title="Change Role">
      <Stack justify="center" mt="lg">
        <Text>Current Role: {user?.role?.name ? user?.role?.name : "N/A"}</Text>
        {user?.role &&
          groupPermissions(user.role.permissions)?.map((group, index) => {
            return (
              <Box key={`current-user-group-${group.name}-${index}`}>
                <Text fz="sm" fw={700} key={`${index}-permission`}>
                  {group.name}
                </Text>

                {group.permissionList.map((permission, permissionIndex) => {
                  return (
                    <Text fz="sm" span key={`current-user-permission-${group.name}-${permissionIndex}`}>
                      {group.permissionList.length - 1 === permissionIndex ? permission.label : `${permission.label}, `}
                    </Text>
                  );
                })}
              </Box>
            );
          })}
        <Divider />
        <Select
          label="Select New Role"
          defaultValue={user?.role?.id.toString()}
          value={newRole?.toString()}
          data={allRoles.sort().map((role) => {
            return {
              label: role.name,
              value: role.id.toString(),
              // If current user is not and admin, can not give admin role
              disabled: currentUser?.role?.id !== 1 && role.id === 1,
            };
          })}
          onChange={(value) => setNewRole(value)}
          searchable
          required
        />
        <SimpleGrid cols={3} spacing="xl" verticalSpacing="sm">
          {filteredCategoriesRoles?.map((group, index) => {
            return (
              <Box key={`role-permission-category-${group.name}`}>
                <Text fz="sm" fw={700} key={`${index}-permission`}>
                  {group.name}
                </Text>

                {group.permissionList.map((permission, itemIndex) => {
                  return (
                    <Text fz="sm" span key={`category-${group.name}-${itemIndex}`}>
                      {group.permissionList.length - 1 === itemIndex ? permission.label : `${permission.label}, `}
                    </Text>
                  );
                })}
              </Box>
            );
          })}
        </SimpleGrid>
        <Button onClick={handleChangeRole} loading={changeRoleMutation.isPending}>
          Update Role
        </Button>
      </Stack>
    </Modal>
  );
};
export default ChangeRoleModal;
