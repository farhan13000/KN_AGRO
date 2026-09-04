import { useCallback } from "react";
import { useAsyncResource } from "../../../shared/hooks";
import { analyticsApi } from "../services";

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
