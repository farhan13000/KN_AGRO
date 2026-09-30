import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

export const pushApi = {
  async getPublicKey() {
    const response = await apiClient.get(API_ENDPOINTS.PUSH.PUBLIC_KEY);
    return unwrapApiData(response);
  },

  async subscribe(subscription) {
    const response = await apiClient.post(API_ENDPOINTS.PUSH.SUBSCRIBE, subscription);
    return unwrapApiData(response);
  },

  async unsubscribe(endpoint) {
    const response = await apiClient.post(API_ENDPOINTS.PUSH.UNSUBSCRIBE, { endpoint });
    return unwrapApiData(response);
  },

  async getPreferences() {
    const response = await apiClient.get(API_ENDPOINTS.PUSH.PREFERENCES);
    return unwrapApiData(response);
  },

  async updatePreferences(payload) {
    const response = await apiClient.patch(API_ENDPOINTS.PUSH.PREFERENCES, payload);
    return unwrapApiData(response);
  },

  async sendTest() {
    const response = await apiClient.post(API_ENDPOINTS.PUSH.TEST);
    return unwrapApiData(response);
  },
};
