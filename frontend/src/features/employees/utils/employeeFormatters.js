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

export const employeeOptionLabel = (employee) => {
  const name = getEmployeeDisplayName(employee);
  const code = employee?.employeeCode ? ` (${employee.employeeCode})` : "";
  return `${name}${code}`;
};
