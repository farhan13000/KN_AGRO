import { useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_EMPLOYEE_QUERY } from "../constants";
import { employeeApi } from "../services/employeeApi";
import { employeeQueryKeys } from "./employeeQueryKeys";

const withDefaultQuery = (query) => ({ ...DEFAULT_EMPLOYEE_QUERY, ...query });

/**
 * These were verbatim copies of the shared hooks — identical fetch and
 * mutate logic, identical return shapes — which quietly kept this entire
 * feature outside the app's cache once the shared ones moved to TanStack
 * Query. Aliased here rather than renamed at all ~15 call sites below, so
 * the whole feature joins the cache as a two-line change.
 */
const useAsyncQuery = useAsyncResource;
const useEmployeeMutation = useAsyncMutation;

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
  transferEmployee: useEmployeeMutation(employeeApi.transferEmployee, { onSuccess }),
  requestPromotion: useEmployeeMutation(employeeApi.requestPromotion, { onSuccess }),
  approveActionRequest: useEmployeeMutation(employeeApi.approveActionRequest, { onSuccess }),
  rejectActionRequest: useEmployeeMutation(employeeApi.rejectActionRequest, { onSuccess }),
});
