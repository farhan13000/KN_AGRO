const emptyValues = new Set(["", null, undefined]);

export const cleanDistrictQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const getDistrictStatusLabel = (status, labels = {}) => labels[status] || status || "Unknown";

// Same wildcard-bypass posture as every other role-tier check in this
// codebase (see roles.constants.js's MANAGER_TIER_ROLES comment) — SA and
// legacy SUPER_ADMIN hold the "*" permission and bypass tier checks
// entirely, mirroring BACKEND/backend's own hasWildcard() helper.
// `hasWildcard` is `useAuth().hasPermission(ALL_PERMISSIONS)`, `roleName`
// is `useAuth().role` (a plain role-name string) — both from the caller,
// since this util has no access to the auth context itself.
export const matchesDistrictTier = (roleName, hasWildcard, tierRoles) =>
  Boolean(hasWildcard) || tierRoles.includes(roleName);
