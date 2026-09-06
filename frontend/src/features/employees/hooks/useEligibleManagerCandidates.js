import { getEligibleManagerRoles, MANAGER_TIER_ROLES } from "../../../shared/constants";
import { EMPLOYEE_STATUS } from "../constants";
import { useAllEmployees } from "./useAllEmployees";

/**
 * Employees who may be assigned as someone's manager.
 *
 * Shared by both places that pick a manager (assign-manager and transfer),
 * which previously would have carried the same query + filter twice. Built
 * on useAllEmployees so the candidate list isn't silently cut off at the
 * endpoint's 100-row page — this company already has more employees than
 * that.
 *
 * `forRoleName`, when given (e.g. the hiring form's currently-selected
 * proposed Role), narrows candidates to exactly the one tier a role of
 * that name must report to (see getEligibleManagerRoles) instead of the
 * static MANAGER_TIER_ROLES list. Omitted, this keeps the original
 * unfiltered-by-role behavior that TransferEmployeeDialog/
 * ManagerAssignmentDialog rely on.
 *
 * The role-tier rule here only decides who to OFFER; the backend's
 * validateReportingRelationship still enforces the actual one-tier-up
 * chain and will reject an ineligible pairing with its own message.
 */
export const useEligibleManagerCandidates = ({ enabled = true, excludeEmployeeId, forRoleName } = {}) => {
  const state = useAllEmployees({ enabled });

  const eligibleRoles = forRoleName ? getEligibleManagerRoles(forRoleName) : MANAGER_TIER_ROLES;

  const candidates = state.employees.filter(
    (candidate) =>
      String(candidate._id) !== String(excludeEmployeeId || "") &&
      candidate.employeeStatus === EMPLOYEE_STATUS.ACTIVE &&
      candidate.user?.status === "ACTIVE" &&
      eligibleRoles.includes(candidate.user?.role?.name),
  );

  return { ...state, candidates };
};
