export const ROLE_KEYS = Object.freeze({
  // Legacy 3-role model — kept as-is until the backend's own Phase 17
  // data migration moves every existing account off these.
  SUPER_ADMIN: "SUPER_ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  EMPLOYEE: "EMPLOYEE",

  // New 7-role sales hierarchy (org-hierarchy migration). SA/OA sit
  // outside the sales chain; GM -> RM -> ASM -> SO -> FO is the
  // reporting line.
  SA: "SA",
  OA: "OA",
  GM: "GM",
  RM: "RM",
  ASM: "ASM",
  SO: "SO",
  FO: "FO",
});

export const BACKEND_ROLES = Object.freeze({
  [ROLE_KEYS.SUPER_ADMIN]: "super_admin",
  [ROLE_KEYS.SALES_MANAGER]: "sales_manager",
  [ROLE_KEYS.EMPLOYEE]: "employee",

  [ROLE_KEYS.SA]: "sa",
  [ROLE_KEYS.OA]: "oa",
  [ROLE_KEYS.GM]: "gm",
  [ROLE_KEYS.RM]: "rm",
  [ROLE_KEYS.ASM]: "asm",
  [ROLE_KEYS.SO]: "so",
  [ROLE_KEYS.FO]: "fo",
});

export const ROLE_LABELS = Object.freeze({
  [BACKEND_ROLES.SUPER_ADMIN]: "Super Admin",
  [BACKEND_ROLES.SALES_MANAGER]: "Sales Manager",
  [BACKEND_ROLES.EMPLOYEE]: "Employee",

  [BACKEND_ROLES.SA]: "State Admin",
  [BACKEND_ROLES.OA]: "Operations Admin",
  [BACKEND_ROLES.GM]: "General Manager",
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
  BACKEND_ROLES.SALES_MANAGER,
  BACKEND_ROLES.GM,
  BACKEND_ROLES.RM,
  BACKEND_ROLES.ASM,
  BACKEND_ROLES.SO,
]);

