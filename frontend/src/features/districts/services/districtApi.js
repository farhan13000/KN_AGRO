import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanDistrictQuery } from "../utils";

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanDistrictQuery(params) });
  return unwrapApiData(response);
};

const post = async (url, payload) => {
  const response = await apiClient.post(url, payload);
  return unwrapApiData(response);
};

const patch = async (url, payload) => {
  const response = await apiClient.patch(url, payload);
  return unwrapApiData(response);
};

export const districtApi = {
  async getDistricts(query) {
    return get(API_ENDPOINTS.DISTRICTS.BASE, query);
  },

  async getDistrictById(districtId) {
    return get(API_ENDPOINTS.DISTRICTS.DETAIL(districtId));
  },

  async createDistrict(payload) {
    return post(API_ENDPOINTS.DISTRICTS.BASE, payload);
  },

  async updateDistrict(districtId, payload) {
    return patch(API_ENDPOINTS.DISTRICTS.DETAIL(districtId), payload);
  },

  // STEP 1 of 3 — propose a manager assignment (first-time).
  async requestAssignment(districtId, payload) {
    return post(API_ENDPOINTS.DISTRICTS.ASSIGN(districtId), payload);
  },

  // Same as requestAssignment, but for a district that already has an
  // active assignment — a separate backend endpoint, same request shape.
  async requestReassignment(districtId, payload) {
    return post(API_ENDPOINTS.DISTRICTS.REASSIGN(districtId), payload);
  },

  // STEP 2 of 3 — GM/OA review. `approve: false` rejects (clears the
  // request back to null, per the backend's own design — there is no
  // REJECTED state to land on).
  async reviewAssignment(districtId, { approve, comment }) {
    return post(API_ENDPOINTS.DISTRICTS.ASSIGN_REVIEW(districtId), { approve, comment });
  },

  // STEP 3 of 3 — SA-only finalize. No body.
  async finalizeAssignment(districtId) {
    return post(API_ENDPOINTS.DISTRICTS.ASSIGN_FINALIZE(districtId), {});
  },
};
