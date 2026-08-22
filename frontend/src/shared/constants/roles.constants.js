export const ROLE_KEYS = Object.freeze({
  SUPER_ADMIN: "SUPER_ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  EMPLOYEE: "EMPLOYEE",
});

export const BACKEND_ROLES = Object.freeze({
  [ROLE_KEYS.SUPER_ADMIN]: "super_admin",
  [ROLE_KEYS.SALES_MANAGER]: "sales_manager",
  [ROLE_KEYS.EMPLOYEE]: "employee",
});

export const ROLE_LABELS = Object.freeze({
  [BACKEND_ROLES.SUPER_ADMIN]: "Super Admin",
  [BACKEND_ROLES.SALES_MANAGER]: "Sales Manager",
  [BACKEND_ROLES.EMPLOYEE]: "Employee",
});

export const normalizeRoleName = (roleName) => String(roleName || "").trim().toLowerCase();

