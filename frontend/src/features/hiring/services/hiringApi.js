import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

const post = async (url, payload) => unwrapApiData(await apiClient.post(url, payload));

export const hiringApi = {
  async createHiringRequest(payload) {
    return post(API_ENDPOINTS.HIRING.BASE, payload);
  },

  async listHiringRequests(query) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.HIRING.BASE, { params: cleanQuery(query) }));
  },

  async getHiringRequest(requestId) {
    return unwrapApiData(await apiClient.get(API_ENDPOINTS.HIRING.DETAIL(requestId)));
  },

  // Stage transitions. Each is additionally narrowed by actor role inside
  // HiringService (process = OA, review = GM, approve = SA, complete =
  // SA/OA, reject = whoever owns the current stage), so a 403 here is an
  // expected outcome for a permitted-but-wrong-tier user.
  async processHiringRequest(requestId, notes) {
    return post(API_ENDPOINTS.HIRING.PROCESS(requestId), { notes });
  },

  async reviewHiringRequest(requestId, comment) {
    return post(API_ENDPOINTS.HIRING.REVIEW(requestId), { comment });
  },

  async approveHiringRequest(requestId) {
    return post(API_ENDPOINTS.HIRING.APPROVE(requestId), {});
  },

  async rejectHiringRequest(requestId, reason) {
    return post(API_ENDPOINTS.HIRING.REJECT(requestId), { reason });
  },

  // Creates the real Employee + User pair.
  async completeHiringRequest(requestId, payload) {
    return post(API_ENDPOINTS.HIRING.COMPLETE(requestId), payload);
  },
};
