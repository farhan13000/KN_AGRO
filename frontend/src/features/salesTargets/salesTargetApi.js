import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../core/api";

export const salesTargetApi = {
  async listTargets() {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.SALES_TARGETS.BASE));
  },
  async setTarget(role, monthlyAmount) {
    return unwrapApiData(await apiClient.put(API_ENDPOINTS.SALES_TARGETS.ROLE(role), { monthlyAmount }));
  },
  async myProgress(month) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.SALES_TARGETS.MY_PROGRESS, { params: month ? { month } : {} }));
  },
  async teamProgress(month) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.SALES_TARGETS.TEAM_PROGRESS, { params: month ? { month } : {} }));
  },
};
