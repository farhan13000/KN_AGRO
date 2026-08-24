import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { pickManualActivityPayload } from "../schemas";
import { cleanLeadActivityQuery } from "../utils";

const getMockLeadActivityApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE4_MOCK === "true")) {
    return null;
  }

  const { mockLeadActivityApi } = await import("../../../mocks/lead-activities/leadActivity.mock");
  return mockLeadActivityApi;
};

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
    const mock = await getMockLeadActivityApi();
    if (mock) return mock.getLeadActivities(leadId, query);
    return get(API_ENDPOINTS.LEADS.ACTIVITIES(leadId), query);
  },

  async createManualActivity(leadId, values) {
    const mock = await getMockLeadActivityApi();
    const payload = pickManualActivityPayload(values);
    if (mock) return mock.createManualActivity(leadId, payload);
    return post(API_ENDPOINTS.LEADS.ACTIVITIES(leadId), payload);
  },
};
