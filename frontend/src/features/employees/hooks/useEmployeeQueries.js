import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import { DEFAULT_EMPLOYEE_QUERY } from "../constants";
import { employeeApi } from "../services/employeeApi";
import { employeeQueryKeys } from "./employeeQueryKeys";

const withDefaultQuery = (query) => ({ ...DEFAULT_EMPLOYEE_QUERY, ...query });

const useAsyncQuery = (queryKey, request, { enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [refreshIndex, setRefreshIndex] = useState(0);
  const stableKey = JSON.stringify(queryKey);

  const refetch = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    request()
      .then((payload) => {
        if (isCurrent) {
          setData(payload);
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [enabled, refreshIndex, stableKey]);

  return {
    data,
    error,
    errorMessage: error ? getApiErrorMessage(error) : "",
    isError: Boolean(error),
    isLoading,
    queryKey,
    refetch,
  };
};

const useEmployeeMutation = (mutationFn, { onSuccess } = {}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await mutationFn(...args);
        if (onSuccess) {
          await onSuccess(payload);
        }
        return payload;
      } catch (mutationError) {
        setError(mutationError);
        throw mutationError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess],
  );

  return {
    error,
    errorMessage: error ? getApiErrorMessage(error) : "",
    isError: Boolean(error),
    isLoading,
    mutate,
  };
};

export const useEmployeeList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  return useAsyncQuery(employeeQueryKeys.list(requestQuery), () => employeeApi.getEmployees(requestQuery), options);
};

export const useEmployeeDetail = (employeeId, options) =>
  useAsyncQuery(
    employeeQueryKeys.detail(employeeId),
    () => employeeApi.getEmployeeById(employeeId),
    { enabled: Boolean(employeeId) && options?.enabled !== false },
  );

export const useMyEmployeeProfile = (options) =>
  useAsyncQuery(employeeQueryKeys.me, () => employeeApi.getMyProfile(), options);

export const usePendingEmployees = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  return useAsyncQuery(
    employeeQueryKeys.pending(requestQuery),
    () => employeeApi.getPendingEmployees(requestQuery),
    options,
  );
};

export const useDirectReports = (employeeId, query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  return useAsyncQuery(
    employeeQueryKeys.directReports(employeeId, requestQuery),
    () => employeeApi.getDirectReports(employeeId, requestQuery),
    { enabled: Boolean(employeeId) && options?.enabled !== false },
  );
};

export const useMyTeam = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  return useAsyncQuery(employeeQueryKeys.myTeam(requestQuery), () => employeeApi.getMyTeam(requestQuery), options);
};

export const useEmployeeHierarchy = (options) =>
  useAsyncQuery(employeeQueryKeys.hierarchy, () => employeeApi.getEmployeeHierarchy(), options);

export const useEmployeeSummary = (options) =>
  useAsyncQuery(employeeQueryKeys.summary, () => employeeApi.getEmployeeSummary(), options);

export const useActionRequests = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 10, ...query }), [query]);
  return useAsyncQuery(
    employeeQueryKeys.actionRequests(requestQuery),
    () => employeeApi.getActionRequests(requestQuery),
    options,
  );
};

export const useEmployeeActions = ({ onSuccess } = {}) => ({
  createEmployee: useEmployeeMutation(employeeApi.createEmployee, { onSuccess }),
  updateEmployee: useEmployeeMutation(employeeApi.updateEmployee, { onSuccess }),
  updateMyProfile: useEmployeeMutation(employeeApi.updateMyProfile, { onSuccess }),
  approveEmployee: useEmployeeMutation(employeeApi.approveEmployee, { onSuccess }),
  rejectEmployee: useEmployeeMutation(employeeApi.rejectEmployee, { onSuccess }),
  assignManager: useEmployeeMutation(employeeApi.assignManager, { onSuccess }),
  deactivateEmployee: useEmployeeMutation(employeeApi.deactivateEmployee, { onSuccess }),
  reactivateEmployee: useEmployeeMutation(employeeApi.reactivateEmployee, { onSuccess }),
  resignEmployee: useEmployeeMutation(employeeApi.resignEmployee, { onSuccess }),
  terminateEmployee: useEmployeeMutation(employeeApi.terminateEmployee, { onSuccess }),
  promoteToManager: useEmployeeMutation(employeeApi.promoteToManager, { onSuccess }),
  transferEmployee: useEmployeeMutation(employeeApi.transferEmployee, { onSuccess }),
  requestPromotion: useEmployeeMutation(employeeApi.requestPromotion, { onSuccess }),
  registerEmployee: useEmployeeMutation(employeeApi.registerEmployee, { onSuccess }),
  approveActionRequest: useEmployeeMutation(employeeApi.approveActionRequest, { onSuccess }),
  rejectActionRequest: useEmployeeMutation(employeeApi.rejectActionRequest, { onSuccess }),
});
