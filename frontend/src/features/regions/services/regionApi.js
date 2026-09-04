import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanRegionQuery } from "../utils";

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanRegionQuery(params) });
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

export const regionApi = {
  async getRegions(query) {
    return get(API_ENDPOINTS.REGIONS.BASE, query);
  },

  async getRegionById(regionId) {
    return get(API_ENDPOINTS.REGIONS.DETAIL(regionId));
  },

  async createRegion(payload) {
    return post(API_ENDPOINTS.REGIONS.BASE, payload);
  },

  async updateRegion(regionId, payload) {
    return patch(API_ENDPOINTS.REGIONS.DETAIL(regionId), payload);
  },
};
