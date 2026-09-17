import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { analyticsApi } from "../services";

/**
 * Company-wide employee performance. Gated on ANALYTICS_ADMIN server-side
 * (Super Admin and Office Admin), so callers must only mount this where
 * the viewer actually holds it — a manager would get a 403.
 *
 * `state`/`district`/`post` narrow the roster to whoever's own coverage
 * names that place — the same "search by location" filter Leads/Orders/
 * Employees already use.
 */
export const useEmployeePerformance = ({ district = "", post = "", state = "", ...options } = {}) => {
  const request = useCallback(
    () => analyticsApi.getEmployeePerformance({ state: state || undefined, district: district || undefined, post: post || undefined }),
    [state, district, post],
  );
  return useAsyncResource(["analytics", "employee-performance", state, district, post], request, options);
};

export const useAdminDashboard = (options) => {
  const request = useCallback(() => analyticsApi.getAdminDashboard(), []);
  return useAsyncResource(["analytics", "admin-dashboard"], request, options);
};

export const useManagerDashboard = (options) => {
  const request = useCallback(() => analyticsApi.getManagerDashboard(), []);
  return useAsyncResource(["analytics", "manager-dashboard"], request, options);
};

export const useEmployeeDashboard = (options) => {
  const request = useCallback(() => analyticsApi.getEmployeeDashboard(), []);
  return useAsyncResource(["analytics", "employee-dashboard"], request, options);
};

export const useSalesOfficerDashboard = (options) => {
  const request = useCallback(() => analyticsApi.getSalesOfficerDashboard(), []);
  return useAsyncResource(["analytics", "so-dashboard"], request, options);
};
