import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

export const auditApi = {
  async listAuditLogs(query) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT.BASE, { params: query });
    return unwrapApiData(response);
  },

  async getAuditLog(auditId) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT.DETAIL(auditId));
    return unwrapApiData(response);
  },
};
