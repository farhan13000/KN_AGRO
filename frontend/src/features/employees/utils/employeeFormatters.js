import { ROLE_LABELS, normalizeRoleName } from "../../../shared/constants";
import {
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  USER_STATUS_LABELS,
} from "../constants";

export const formatEmployeeStatus = (status) =>
  EMPLOYEE_STATUS_LABELS[status] || status || "Unknown";

export const formatEmploymentType = (employmentType) =>
  EMPLOYMENT_TYPE_LABELS[employmentType] || employmentType || "Not Set";

export const formatUserStatus = (status) => USER_STATUS_LABELS[status] || status || "Unknown";

export const getEmployeeDisplayName = (employee) =>
  employee?.user?.name || employee?.applicant?.name || "Unnamed Employee";

export const getEmployeeEmail = (employee) => employee?.user?.email || employee?.applicant?.email || "";

export const formatEmployeeCode = (employee) => employee?.employeeCode || "Not Assigned";

/**
 * The role this person actually holds, as a readable label.
 *
 * Deliberately NOT `designation`: that is a free-text field somebody
 * typed, and it is routinely wrong (a seeded ASM whose designation reads
 * "GM"). The role is the one that decides what they can do, so it is the
 * one shown beside a name.
 */
export const getEmployeeRoleName = (employee) =>
  normalizeRoleName(employee?.user?.role?.name || employee?.role?.name || "");

export const formatEmployeeRole = (employee) => {
  const roleName = getEmployeeRoleName(employee);
  if (!roleName) return "";
  return ROLE_LABELS[roleName] || roleName.toUpperCase();
};

/**
 * The short form — "RM", "ASM" — for tight places like a table cell or a
 * tree node, where the full label would wrap.
 */
export const formatEmployeeRoleShort = (employee) => {
  const roleName = getEmployeeRoleName(employee);
  return roleName ? roleName.toUpperCase() : "";
};

export const employeeOptionLabel = (employee) => {
  const name = getEmployeeDisplayName(employee);
  const code = employee?.employeeCode ? ` (${employee.employeeCode})` : "";
  const role = formatEmployeeRoleShort(employee);
  return `${name}${role ? ` · ${role}` : ""}${code}`;
};
