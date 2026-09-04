// Direct file import rather than the employees barrel — that barrel now
// re-exports a hook which imports from `features/districts`, so routing
// through it would make the module graph circular.
import { useAllEmployees } from "../../employees/hooks/useAllEmployees";

/**
 * Every ACTIVE employee, split into RM and ASM candidate lists.
 *
 * Role filtering happens client-side because the employees endpoint has
 * no role filter (see the backend's listEmployeesSchema —
 * page/limit/search/employeeStatus/department/designation/manager/
 * employmentType only), which is also why this leans on useAllEmployees
 * rather than a single page: one 100-row page silently drops valid
 * candidates once the company passes 100 employees.
 */
export const useAssignmentCandidates = ({ enabled = true } = {}) => {
  const state = useAllEmployees({ enabled });
  const { employees } = state;

  return {
    ...state,
    rmCandidates: employees.filter((employee) => employee.user?.role?.name === "rm"),
    asmCandidates: employees.filter((employee) => employee.user?.role?.name === "asm"),
  };
};
