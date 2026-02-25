import { getGetAllRolesQueryKey, useCreateRole, useGetAllRoles, useGetRoleAllPermissions } from "@/utils/api";
import { RolePermissionsItem } from "@/utils/api.schemas";
import { formatPermission } from "@/utils/permissionGrouping";
import Modal from "@components/Modal/Modal";
import { Button, MultiSelect, Stack, TextInput } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";

interface MyModalProps {
  isOpened: boolean;
  closeModal: () => void;
  handleOnSuccess?: () => void;
}

const CreateRoleModal = ({ isOpened, closeModal, handleOnSuccess }: MyModalProps) => {
  const queryClient = useQueryClient();
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<RolePermissionsItem[]>([]);

  const { data: allPermissions } = useGetRoleAllPermissions();
  const { refetch: refetchRoles } = useGetAllRoles();

  const categorizedPermissions = useMemo(() => {
    if (!allPermissions) return [];
    const groupedPermissions: Record<string, { label: string; value: string }[]> = {};

    allPermissions.forEach((permission) => {
      const [category, _] = permission.split(".");

      if (!groupedPermissions[category]) {
        groupedPermissions[category] = [];
      }

      groupedPermissions[category].push({ label: formatPermission(permission), value: permission });
    });

    return Object.entries(groupedPermissions).map(([name, permissionList]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      permissionList,
    }));
  }, [allPermissions]);

  const changeRoleMutation = useCreateRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [getGetAllRolesQueryKey()] });
        handleOnSuccess && handleOnSuccess();
        handleClose();
      },
    },
  });

  const handleCreateRole = () => {
    changeRoleMutation.mutate({
      data: {
        name: roleName,
        permissions: permissions,
      },
    });
  };

  const handleClose = () => {
    setRoleName("");
    setPermissions([]);
    refetchRoles();
    closeModal();
  };

  return (
    <Modal size="xl" opened={isOpened} onClose={handleClose} title="Create Role">
      <Stack justify="center" mt="lg">
        <TextInput
          label="Role Name"
          value={roleName}
          onChange={(value) => {
            setRoleName(value.currentTarget.value);
          }}
        />
        <MultiSelect
          label="Role Permissions"
          value={permissions}
          data={categorizedPermissions.map((category) => {
            return {
              group: category.name,
              items: category.permissionList,
            };
          })}
          onChange={(value) => {
            setPermissions(value as RolePermissionsItem[]);
          }}
        />
        <Button onClick={handleCreateRole} loading={changeRoleMutation.isPending}>
          Create Role
        </Button>
      </Stack>
    </Modal>
  );
};
export default CreateRoleModal;
