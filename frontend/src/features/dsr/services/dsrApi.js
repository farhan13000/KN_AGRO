import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

const post = async (url, payload) => unwrapApiData(await apiClient.post(url, payload));

// The backend's own serializer already converts salesAmount to rupees for
// every response (unlike SalaryProposal's own responses — see that
// feature's own note on this asymmetry); no client-side conversion needed
// here, only on submit, where the API already expects rupees directly.
export const dsrApi = {
  async submitDSR(payload) {
    return post(API_ENDPOINTS.DSR.BASE, payload);
  },

  async listMyDSRs(query) {
    const response = await apiClient.get(API_ENDPOINTS.DSR.ME, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listTeamDSRs(query) {
    const response = await apiClient.get(API_ENDPOINTS.DSR.TEAM, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listAllDSRs(query) {
    const response = await apiClient.get(API_ENDPOINTS.DSR.BASE, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  // Comment is optional per the backend's reviewDSRSchema.
  async reviewDSR(dsrId, comment) {
    return post(API_ENDPOINTS.DSR.REVIEW(dsrId), { comment });
  },

  // No body accepted by the backend for this one.
  async acknowledgeDSR(dsrId) {
    return post(API_ENDPOINTS.DSR.ACKNOWLEDGE(dsrId), {});
  },
};
