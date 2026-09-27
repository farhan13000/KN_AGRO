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

// Mirrors the backend's REQUIRED_MANAGER_ROLE — the manager each role
// would NORMALLY have, one tier up. No longer a restriction on either
// side: a manager may be anyone more senior (see getEligibleManagerRoles
// below). Kept so a picker can put the obvious choice first.
export const REQUIRED_MANAGER_ROLE = Object.freeze({
  [BACKEND_ROLES.FO]: BACKEND_ROLES.SO,
  [BACKEND_ROLES.SO]: BACKEND_ROLES.ASM,
  [BACKEND_ROLES.ASM]: BACKEND_ROLES.RM,
  [BACKEND_ROLES.RM]: BACKEND_ROLES.GM,
  // The top step, where the chain leaves sales: a GM reports to the
  // Office Admin. The Super Admin is never in this table — SA usually
  // has no Employee record to point a manager field at.
  [BACKEND_ROLES.GM]: BACKEND_ROLES.OA,
});

// Mirrors the backend's MANAGER_ASSIGNABLE_ROLES — every role that may
// be picked as somebody's manager: everyone except the FO, who is the
// bottom tier. Same "pickers only" rule as above.
export const MANAGER_ASSIGNABLE_ROLES = Object.freeze([
  ...MANAGER_TIER_ROLES,
  BACKEND_ROLES.OA,
  BACKEND_ROLES.SA,
]);

/**
 * The whole company, most senior first — mirrors the backend's
 * ORG_SENIORITY. Separate from MANAGER_TIER_ROLES because this one
 * answers "who outranks whom", which includes SA and OA.
 */
export const ORG_SENIORITY = Object.freeze([
  BACKEND_ROLES.SA,
  BACKEND_ROLES.OA,
  BACKEND_ROLES.GM,
  BACKEND_ROLES.RM,
  BACKEND_ROLES.ASM,
  BACKEND_ROLES.SO,
  BACKEND_ROLES.FO,
]);

/**
 * Which roles to offer as reporting-manager candidates for a given role:
 * everyone who outranks them. A field officer may report to an SO, an
 * ASM, an RM, a GM, the Office Admin or the Super Admin — which one is
 * the company's decision, not the form's.
 *
 * An unknown role (or none picked yet) falls back to the full list
 * rather than showing nobody.
 */
export const getEligibleManagerRoles = (roleName) => {
  const normalized = normalizeRoleName(roleName);
  const rank = ORG_SENIORITY.indexOf(normalized);
  if (rank === -1) return MANAGER_ASSIGNABLE_ROLES;
  return ORG_SENIORITY.slice(0, rank).filter((role) => MANAGER_ASSIGNABLE_ROLES.includes(role));
};

