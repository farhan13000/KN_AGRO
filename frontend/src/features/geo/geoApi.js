import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../core/api";

// India's states and districts (shipped with the app) and post offices
// (looked up live from India Post when someone searches).
export const geoApi = {
  async listStates() {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.GEO.STATES));
  },
  async listDistricts(states = []) {
    return unwrapApiData(
      await apiClient.get(API_ENDPOINTS.GEO.DISTRICTS, {
        params: states.length ? { states: states.join(",") } : {},
      }),
    );
  },
  async searchPostOffices({ q, state, district }) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.GEO.POST_OFFICES, { params: { q, state, district } }));
  },
};
