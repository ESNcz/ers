import { GetRoleAllPermissions200Item, RolePermissionsItem } from "@/utils/api.schemas";

export const formatPermission = (permission: string): string => {
  return permission
    .split(".")
    .join(" ") // Take the second part (action)
    .replace(/([A-Z])/g, " $1") // Add space before uppercase letters (CamelCase support)
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
};

export const groupPermissions = (permissions: RolePermissionsItem[] | GetRoleAllPermissions200Item[]) => {
  const groupedPermissions: Record<string, { label: string; value: string }[]> = {};

  permissions.forEach((permission) => {
    const [category, _] = permission.split(".");

    if (!groupedPermissions[category]) {
      groupedPermissions[category] = [];
    }

    groupedPermissions[category].push({ label: formatPermission(permission), value: permission });
  });

  return Object.entries(groupedPermissions).map(([name, permissionList]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize category name
    permissionList,
  }));
};
