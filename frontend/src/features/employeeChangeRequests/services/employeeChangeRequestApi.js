import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

// The approver's side of an employee edit somebody else proposed. There
// is no create call here on purpose: a request is raised by saving the
// employee form, not by a separate action.
export const employeeChangeRequestApi = {
  async list(query) {
    const response = await apiClient.get(API_ENDPOINTS.EMPLOYEE_CHANGE_REQUESTS.BASE, { params: query });
    return unwrapApiData(response);
  },

  async decide(requestId, decision, reason) {
    const response = await apiClient.post(API_ENDPOINTS.EMPLOYEE_CHANGE_REQUESTS.DECISION(requestId), {
      decision,
      ...(reason ? { reason } : {}),
    });
    return unwrapApiData(response);
  },
};
