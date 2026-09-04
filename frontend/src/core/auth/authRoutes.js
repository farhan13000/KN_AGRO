import { BACKEND_ROLES, ROLE_LABELS, normalizeRoleName, ROUTES } from "../../shared/constants";

export const getPortalRouteForRole = (roleName) => {
  const normalizedRole = normalizeRoleName(roleName);

  if (normalizedRole === BACKEND_ROLES.SUPER_ADMIN || normalizedRole === BACKEND_ROLES.SA || normalizedRole === BACKEND_ROLES.OA) {
    return ROUTES.SUPER_ADMIN.DASHBOARD;
  }

  if (
    normalizedRole === BACKEND_ROLES.SALES_MANAGER ||
    normalizedRole === BACKEND_ROLES.GM ||
    normalizedRole === BACKEND_ROLES.RM ||
    normalizedRole === BACKEND_ROLES.ASM ||
    normalizedRole === BACKEND_ROLES.SO
  ) {
    return ROUTES.SALES_MANAGER.DASHBOARD;
  }

  if (normalizedRole === BACKEND_ROLES.EMPLOYEE || normalizedRole === BACKEND_ROLES.FO) {
    return ROUTES.EMPLOYEE.DASHBOARD;
  }

  return ROUTES.ERROR.UNAUTHORIZED;
};

// Role-appropriate portal title for the sidebar/header (e.g. "General
// Manager Portal" for a GM, "Sales Manager Portal" for the legacy role) —
// used by the three portal XLayout.jsx wrappers instead of each hardcoding
// its own single label, which read wrong the moment a portal started
// being reused by more than one role (Phase F02).
export const getPortalLabelForRole = (roleName) => {
  const normalizedRole = normalizeRoleName(roleName);
  return `${ROLE_LABELS[normalizedRole] || "Portal"} Portal`;
};

