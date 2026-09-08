import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

// Every dashboard endpoint here already returns the finished, scope-
// resolved payload documented in the backend's own dashboard.service.js
// contracts — this layer does no reshaping or client-side aggregation,
// only unwraps the response envelope.
export const analyticsApi = {
  async getEmployeePerformance() {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.EMPLOYEE_PERFORMANCE);
    return unwrapApiData(response);
  },

  async getAdminDashboard(query) {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.ADMIN_DASHBOARD, { params: query });
    return unwrapApiData(response);
  },

  async getManagerDashboard(query) {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.MANAGER_DASHBOARD, { params: query });
    return unwrapApiData(response);
  },

  async getEmployeeDashboard() {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.EMPLOYEE_DASHBOARD);
    return unwrapApiData(response);
  },

  async getSalesOfficerDashboard() {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.SO_DASHBOARD);
    return unwrapApiData(response);
  },
};
