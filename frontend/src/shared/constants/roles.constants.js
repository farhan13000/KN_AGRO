/**
 * The complete set of roles — the 7-role sales hierarchy, and nothing
 * else. SA and OA sit outside the sales chain; GM -> RM -> ASM -> SO ->
 * FO is the reporting line.
 *
 * The legacy 3-role model (super_admin / sales_manager / employee) has
 * been removed from the backend outright, its role documents deleted and
 * every account migrated off them. Do not reintroduce those names here:
 * a role string with no matching Role document grants nothing, so a
 * stale reference would silently deny access rather than fail loudly.
 */
export const ROLE_KEYS = Object.freeze({
  SA: "SA",
  OA: "OA",
  GM: "GM",
  RM: "RM",
  ASM: "ASM",
  SO: "SO",
  FO: "FO",
});

export const BACKEND_ROLES = Object.freeze({
  [ROLE_KEYS.SA]: "sa",
  [ROLE_KEYS.OA]: "oa",
  [ROLE_KEYS.GM]: "gm",
  [ROLE_KEYS.RM]: "rm",
  [ROLE_KEYS.ASM]: "asm",
  [ROLE_KEYS.SO]: "so",
  [ROLE_KEYS.FO]: "fo",
});

export const ROLE_LABELS = Object.freeze({
  [BACKEND_ROLES.SA]: "Super Admin",
  [BACKEND_ROLES.OA]: "Office Admin",
  [BACKEND_ROLES.GM]: "Global Manager",
  [BACKEND_ROLES.RM]: "Regional Manager",
  [BACKEND_ROLES.ASM]: "Area Sales Manager",
  [BACKEND_ROLES.SO]: "Sales Officer",
  [BACKEND_ROLES.FO]: "Field Officer",
});

export const normalizeRoleName = (roleName) => String(roleName || "").trim().toLowerCase();

// Mirrors the backend's own MANAGER_TIER_ROLES
// (BACKEND/backend/src/core/authorization/hierarchy.service.js) — which
// role names may be assigned as anyone's manager. Kept in sync by hand;
// if the backend's own list ever changes, update this to match. Use this
// ONLY to populate candidate-manager pickers, never for an actual
// access-control decision — that rule lives on the backend.
export const MANAGER_TIER_ROLES = Object.freeze([
  BACKEND_ROLES.GM,
  BACKEND_ROLES.RM,
  BACKEND_ROLES.ASM,
  BACKEND_ROLES.SO,
]);

// Mirrors the backend's own REQUIRED_MANAGER_ROLE (also
// core/authorization/hierarchy.service.js) — the fixed one-tier-up chain
// for the 7-role sales hierarchy. Kept in sync by hand, same as
// MANAGER_TIER_ROLES above. Use ONLY to narrow a manager picker to the
// tier a given role structurally must report to, never for an actual
// access-control decision — the backend's own validateReportingRelationship
// is what actually enforces this at completeHiring/assignManager time.
export const REQUIRED_MANAGER_ROLE = Object.freeze({
  [BACKEND_ROLES.FO]: BACKEND_ROLES.SO,
  [BACKEND_ROLES.SO]: BACKEND_ROLES.ASM,
  [BACKEND_ROLES.ASM]: BACKEND_ROLES.RM,
  [BACKEND_ROLES.RM]: BACKEND_ROLES.GM,
});

/**
 * Which roles should be offered as reporting-manager candidates for a
 * given role name. Roles with a fixed one-tier-up rule (FO/SO/ASM/RM)
 * resolve to exactly that one role; every other role (GM/OA/SA, or no
 * role picked yet) falls back to the full MANAGER_TIER_ROLES list,
 * matching the picker's original unfiltered behavior.
 */
export const getEligibleManagerRoles = (roleName) => {
  const normalized = normalizeRoleName(roleName);
  const requiredRole = REQUIRED_MANAGER_ROLE[normalized];
  return requiredRole ? [requiredRole] : MANAGER_TIER_ROLES;
};

