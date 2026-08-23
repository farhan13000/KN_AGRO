import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanProductQuery } from "../utils";

const getMockProductApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE3_MOCK === "true")) {
    return null;
  }

  const { mockProductApi } = await import("../../../mocks/products/product.mock");
  return mockProductApi;
};

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanProductQuery(params) });
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

export const productApi = {
  async getProducts(query) {
    const mock = await getMockProductApi();
    if (mock) return mock.getProducts(query);
    return get(API_ENDPOINTS.PRODUCTS.BASE, query);
  },

  async getProductSummary() {
    const mock = await getMockProductApi();
    if (mock) return mock.getProductSummary();
    return get(API_ENDPOINTS.PRODUCTS.SUMMARY);
  },

  async getProductById(productId) {
    const mock = await getMockProductApi();
    if (mock) return mock.getProductById(productId);
    return get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
  },

  async createProduct(payload) {
    const mock = await getMockProductApi();
    if (mock) return mock.createProduct(payload);
    return post(API_ENDPOINTS.PRODUCTS.BASE, payload);
  },

  async updateProduct(productId, payload) {
    const mock = await getMockProductApi();
    if (mock) return mock.updateProduct(productId, payload);
    return patch(API_ENDPOINTS.PRODUCTS.DETAIL(productId), payload);
  },

  async changeProductStatus(productId, statusOrPayload) {
    const mock = await getMockProductApi();
    const payload =
      typeof statusOrPayload === "string" ? { status: statusOrPayload } : statusOrPayload;
    if (mock) return mock.changeProductStatus(productId, payload);
    return patch(API_ENDPOINTS.PRODUCTS.STATUS(productId), payload);
  },
};
