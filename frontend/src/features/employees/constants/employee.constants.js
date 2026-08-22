export const EMPLOYEE_STATUS = Object.freeze({
  PENDING_APPROVAL: "PENDING_APPROVAL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  RESIGNED: "RESIGNED",
  TERMINATED: "TERMINATED",
  REJECTED: "REJECTED",
});

export const EMPLOYEE_STATUS_LABELS = Object.freeze({
  [EMPLOYEE_STATUS.PENDING_APPROVAL]: "Pending Approval",
  [EMPLOYEE_STATUS.ACTIVE]: "Active",
  [EMPLOYEE_STATUS.INACTIVE]: "Inactive",
  [EMPLOYEE_STATUS.RESIGNED]: "Resigned",
  [EMPLOYEE_STATUS.TERMINATED]: "Terminated",
  [EMPLOYEE_STATUS.REJECTED]: "Rejected",
});

export const EMPLOYMENT_TYPE = Object.freeze({
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  INTERN: "INTERN",
  TEMPORARY: "TEMPORARY",
});

export const EMPLOYMENT_TYPE_LABELS = Object.freeze({
  [EMPLOYMENT_TYPE.FULL_TIME]: "Full Time",
  [EMPLOYMENT_TYPE.PART_TIME]: "Part Time",
  [EMPLOYMENT_TYPE.CONTRACT]: "Contract",
  [EMPLOYMENT_TYPE.INTERN]: "Intern",
  [EMPLOYMENT_TYPE.TEMPORARY]: "Temporary",
});

export const USER_STATUS_LABELS = Object.freeze({
  ACTIVE: "Active",
  PENDING: "Pending",
  SUSPENDED: "Suspended",
  DISABLED: "Disabled",
});

export const EMPLOYEE_SORT_FIELDS = Object.freeze([
  "employeeCode",
  "dateOfJoining",
  "createdAt",
  "updatedAt",
  "department",
  "designation",
  "employeeStatus",
  "employmentType",
]);

export const DEFAULT_EMPLOYEE_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
});

export const ACTION_REQUEST_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
});

export const ACTION_REQUEST_TYPE = Object.freeze({
  EMPLOYEE_APPROVAL: "EMPLOYEE_APPROVAL",
  MANAGER_PROMOTION: "MANAGER_PROMOTION",
});
