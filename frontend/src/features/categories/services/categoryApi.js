import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanCategoryQuery } from "../utils";

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanCategoryQuery(params) });
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

export const categoryApi = {
  async getCategories(query) {
    return get(API_ENDPOINTS.CATEGORIES.BASE, query);
  },

  async getCategoryById(categoryId) {
    return get(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
  },

  async createCategory(payload) {
    return post(API_ENDPOINTS.CATEGORIES.BASE, payload);
  },

  async updateCategory(categoryId, payload) {
    return patch(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId), payload);
  },

  async changeCategoryStatus(categoryId, statusOrPayload) {
    const payload =
      typeof statusOrPayload === "string" ? { status: statusOrPayload } : statusOrPayload;
    return patch(API_ENDPOINTS.CATEGORIES.STATUS(categoryId), payload);
  },
};
