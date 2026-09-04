import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { salaryApi } from "../services";

export const useCurrentSalaryStructure = (employeeId) => {
  const request = useCallback(() => salaryApi.getCurrentSalaryStructure(employeeId), [employeeId]);
  const state = useAsyncResource(["salary", "current", employeeId], request, { enabled: Boolean(employeeId) });

  return { ...state, salaryStructure: state.data?.salaryStructure || null };
};
