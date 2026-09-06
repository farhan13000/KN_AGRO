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

  // Two decisions only, both the Super Admin's: approve (which also
  // creates the account) or reject. Narrowed again by actor role inside
  // HiringService, so a 403 here is the expected outcome for anyone else.
  // Approving IS creating the account, so this carries the same payload
  // the old separate "complete" call used to.
  async approveHiringRequest(requestId, payload) {
    return post(API_ENDPOINTS.HIRING.APPROVE(requestId), payload || {});
  },

  async rejectHiringRequest(requestId, reason) {
    return post(API_ENDPOINTS.HIRING.REJECT(requestId), { reason });
  },

  // Creates the real Employee + User pair.
  async completeHiringRequest(requestId, payload) {
    return post(API_ENDPOINTS.HIRING.COMPLETE(requestId), payload);
  },
};
