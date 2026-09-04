import { BACKEND_ROLES, ROLE_LABELS, normalizeRoleName, ROUTES } from "../../shared/constants";

/**
 * The single source of truth for "which portal's ROUTES block does this
 * role belong to" — matches each portal route file's own allowedRoles
 * list exactly (routes/SuperAdminRoutes.jsx, SalesManagerRoutes.jsx,
 * EmployeeRoutes.jsx). `getPortalRouteForRole` (login/unauthorized
 * redirects) and Phase F13's notification deep-linking (features/
 * notifications/utils/notificationDestination.js) both build on this one
 * mapping rather than each maintaining its own copy.
 */
export const getPortalRoutesForRole = (roleName) => {
  const normalizedRole = normalizeRoleName(roleName);

  if (normalizedRole === BACKEND_ROLES.SUPER_ADMIN || normalizedRole === BACKEND_ROLES.SA || normalizedRole === BACKEND_ROLES.OA) {
    return ROUTES.SUPER_ADMIN;
  }

  if (
    normalizedRole === BACKEND_ROLES.SALES_MANAGER ||
    normalizedRole === BACKEND_ROLES.GM ||
    normalizedRole === BACKEND_ROLES.RM ||
    normalizedRole === BACKEND_ROLES.ASM ||
    normalizedRole === BACKEND_ROLES.SO
  ) {
    return ROUTES.SALES_MANAGER;
  }

  if (normalizedRole === BACKEND_ROLES.EMPLOYEE || normalizedRole === BACKEND_ROLES.FO) {
    return ROUTES.EMPLOYEE;
  }

  return null;
};

export const getPortalRouteForRole = (roleName) => getPortalRoutesForRole(roleName)?.DASHBOARD || ROUTES.ERROR.UNAUTHORIZED;

// Role-appropriate portal title for the sidebar/header (e.g. "General
// Manager Portal" for a GM, "Sales Manager Portal" for the legacy role) —
// used by the three portal XLayout.jsx wrappers instead of each hardcoding
// its own single label, which read wrong the moment a portal started
// being reused by more than one role (Phase F02).
export const getPortalLabelForRole = (roleName) => {
  const normalizedRole = normalizeRoleName(roleName);
  return `${ROLE_LABELS[normalizedRole] || "Portal"} Portal`;
};

