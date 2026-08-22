import { PERMISSIONS } from "../../../shared/constants";
import { BACKEND_ROLES } from "../../../shared/constants/roles.constants";
import { EMPLOYEE_STATUS } from "../constants";

export const EMPLOYEE_LIFECYCLE_ACTIONS = Object.freeze({
  APPROVE: "approve",
  REJECT: "reject",
  ASSIGN_MANAGER: "assignManager",
  DEACTIVATE: "deactivate",
  REACTIVATE: "reactivate",
  RESIGN: "resign",
  TERMINATE: "terminate",
  PROMOTE: "promote",
});

export const canShowEmployeeLifecycleAction = ({ employee, action, hasPermission }) => {
  if (!employee || !action || typeof hasPermission !== "function") return false;

  const status = employee.employeeStatus;
  const roleName = employee.user?.role?.name;

  if (action === EMPLOYEE_LIFECYCLE_ACTIONS.APPROVE || action === EMPLOYEE_LIFECYCLE_ACTIONS.REJECT) {
    return status === EMPLOYEE_STATUS.PENDING_APPROVAL && hasPermission(PERMISSIONS.EMPLOYEES_APPROVE);
  }

  if (action === EMPLOYEE_LIFECYCLE_ACTIONS.ASSIGN_MANAGER) {
    return hasPermission(PERMISSIONS.EMPLOYEES_ASSIGN_MANAGER);
  }

  if (
    [
      EMPLOYEE_LIFECYCLE_ACTIONS.DEACTIVATE,
      EMPLOYEE_LIFECYCLE_ACTIONS.RESIGN,
      EMPLOYEE_LIFECYCLE_ACTIONS.TERMINATE,
    ].includes(action)
  ) {
    return status === EMPLOYEE_STATUS.ACTIVE && hasPermission(PERMISSIONS.EMPLOYEES_DEACTIVATE);
  }

  if (action === EMPLOYEE_LIFECYCLE_ACTIONS.REACTIVATE) {
    return status === EMPLOYEE_STATUS.INACTIVE && hasPermission(PERMISSIONS.EMPLOYEES_UPDATE);
  }

  if (action === EMPLOYEE_LIFECYCLE_ACTIONS.PROMOTE) {
    return (
      status === EMPLOYEE_STATUS.ACTIVE &&
      roleName !== BACKEND_ROLES.SALES_MANAGER &&
      hasPermission(PERMISSIONS.EMPLOYEES_PROMOTE)
    );
  }

  return false;
};
