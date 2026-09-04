import { PERMISSIONS } from "../../../shared/constants";
import { EMPLOYEE_STATUS } from "../constants";

/**
 * PROMOTE is deliberately absent. Promotion is no longer a one-click
 * lifecycle action against a single hardcoded target role — it is the
 * backend's recommend -> approve/reject workflow, surfaced through
 * `features/promotions` (PromotionRecommendDialog + the approvals queue).
 */
export const EMPLOYEE_LIFECYCLE_ACTIONS = Object.freeze({
  APPROVE: "approve",
  REJECT: "reject",
  ASSIGN_MANAGER: "assignManager",
  DEACTIVATE: "deactivate",
  REACTIVATE: "reactivate",
  RESIGN: "resign",
  TERMINATE: "terminate",
});

export const canShowEmployeeLifecycleAction = ({ employee, action, hasPermission }) => {
  if (!employee || !action || typeof hasPermission !== "function") return false;

  const status = employee.employeeStatus;

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

  return false;
};
