import { ALL_PERMISSIONS } from "../../shared/constants";
import { authApi } from "../../auth";

const hasPermission = (permissions, permission) => {
  if (!permission) return true;
  if (!Array.isArray(permissions)) return false;
  return permissions.includes(ALL_PERMISSIONS) || permissions.includes(permission);
};

export const accessControlProvider = {
  async can({ resource, action, params }) {
    const permission = params?.permission || (resource && action ? `${resource}.${action}` : "");
    const user = await authApi.getCurrentUser();
    const permissions = user?.role?.permissions || [];
    const canAccess = hasPermission(permissions, permission);

    return {
      can: canAccess,
      reason: canAccess ? undefined : "You do not have permission to access this action.",
    };
  },
};

