import { useCallback, useMemo } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { salaryApi } from "../services";

export const useCurrentSalaryStructure = (employeeId) => {
  const request = useCallback(() => salaryApi.getCurrentSalaryStructure(employeeId), [employeeId]);
  const state = useAsyncResource(["salary", "current", employeeId], request, { enabled: Boolean(employeeId) });

  return { ...state, salaryStructure: state.data?.salaryStructure || null };
};

export const useMySalaryStructure = (options) => {
  const request = useCallback(() => salaryApi.getMySalaryStructure(), []);
  const state = useAsyncResource(["salary", "me"], request, options);

  return { ...state, salaryStructure: state.data?.salaryStructure || null };
};

export const useSalaryHistory = (employeeId, query, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 20, ...query }), [query]);
  const request = useCallback(
    () => salaryApi.getSalaryHistory(employeeId, requestQuery),
    [employeeId, requestQuery],
  );
  const state = useAsyncResource(["salary", "history", employeeId, requestQuery], request, {
    enabled: Boolean(employeeId) && options?.enabled !== false,
  });

  // The controller returns this list under `salaryStructures` (not
  // `structures`, which is the service's own internal name).
  return {
    ...state,
    structures: state.data?.salaryStructures || [],
    pagination: state.data?.pagination || {},
  };
};
