import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { pickManualActivityPayload } from "../schemas";
import { cleanLeadActivityQuery } from "../utils";

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanLeadActivityQuery(params) });
  return unwrapApiData(response);
};

const post = async (url, payload) => {
  const response = await apiClient.post(url, payload);
  return unwrapApiData(response);
};

export const leadActivityApi = {
  async getLeadActivities(leadId, query) {
    return get(API_ENDPOINTS.LEADS.ACTIVITIES(leadId), query);
  },

  async createManualActivity(leadId, values) {
    const payload = pickManualActivityPayload(values);
    return post(API_ENDPOINTS.LEADS.ACTIVITIES(leadId), payload);
  },
};
