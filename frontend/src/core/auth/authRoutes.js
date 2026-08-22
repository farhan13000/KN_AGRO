import { BACKEND_ROLES, normalizeRoleName, ROUTES } from "../../shared/constants";

export const getPortalRouteForRole = (roleName) => {
  const normalizedRole = normalizeRoleName(roleName);

  if (normalizedRole === BACKEND_ROLES.SUPER_ADMIN) {
    return ROUTES.SUPER_ADMIN.DASHBOARD;
  }

  if (normalizedRole === BACKEND_ROLES.SALES_MANAGER) {
    return ROUTES.SALES_MANAGER.DASHBOARD;
  }

  if (normalizedRole === BACKEND_ROLES.EMPLOYEE) {
    return ROUTES.EMPLOYEE.DASHBOARD;
  }

  return ROUTES.ERROR.UNAUTHORIZED;
};

