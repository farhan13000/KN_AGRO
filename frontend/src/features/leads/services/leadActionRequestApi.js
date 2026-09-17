import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

// A field employee's "please do this" request to their manager on a lead.
export const leadActionRequestApi = {
  async list(query) {
    const response = await apiClient.get(API_ENDPOINTS.LEAD_ACTION_REQUESTS.BASE, { params: query });
    return unwrapApiData(response);
  },

  async create({ leadId, type, note }) {
    const response = await apiClient.post(API_ENDPOINTS.LEAD_ACTION_REQUESTS.BASE, {
      leadId,
      type,
      ...(note ? { note } : {}),
    });
    return unwrapApiData(response);
  },

  async complete(requestId, note) {
    const response = await apiClient.patch(API_ENDPOINTS.LEAD_ACTION_REQUESTS.COMPLETE(requestId), note ? { note } : {});
    return unwrapApiData(response);
  },

  async cancel(requestId) {
    const response = await apiClient.patch(API_ENDPOINTS.LEAD_ACTION_REQUESTS.CANCEL(requestId));
    return unwrapApiData(response);
  },
};
