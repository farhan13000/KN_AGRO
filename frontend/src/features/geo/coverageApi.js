import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../core/api";

// Who covers where — the data behind the Locations map.
export const coverageApi = {
  async summary() {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.EMPLOYEE_COVERAGE.SUMMARY));
  },
  async inState(state, district) {
    return unwrapApiData(
      await apiClient.get(API_ENDPOINTS.EMPLOYEE_COVERAGE.BASE, { params: district ? { state, district } : { state } }),
    );
  },
};
