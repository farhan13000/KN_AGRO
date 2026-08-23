import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanCategoryQuery } from "../utils";

const getMockCategoryApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE3_MOCK === "true")) {
    return null;
  }

  const { mockCategoryApi } = await import("../../../mocks/categories/category.mock");
  return mockCategoryApi;
};

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
    const mock = await getMockCategoryApi();
    if (mock) return mock.getCategories(query);
    return get(API_ENDPOINTS.CATEGORIES.BASE, query);
  },

  async getCategoryById(categoryId) {
    const mock = await getMockCategoryApi();
    if (mock) return mock.getCategoryById(categoryId);
    return get(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
  },

  async createCategory(payload) {
    const mock = await getMockCategoryApi();
    if (mock) return mock.createCategory(payload);
    return post(API_ENDPOINTS.CATEGORIES.BASE, payload);
  },

  async updateCategory(categoryId, payload) {
    const mock = await getMockCategoryApi();
    if (mock) return mock.updateCategory(categoryId, payload);
    return patch(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId), payload);
  },

  async changeCategoryStatus(categoryId, statusOrPayload) {
    const mock = await getMockCategoryApi();
    const payload =
      typeof statusOrPayload === "string" ? { status: statusOrPayload } : statusOrPayload;
    if (mock) return mock.changeCategoryStatus(categoryId, payload);
    return patch(API_ENDPOINTS.CATEGORIES.STATUS(categoryId), payload);
  },
};
