import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanProductQuery } from "../utils";

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
    return get(API_ENDPOINTS.PRODUCTS.BASE, query);
  },

  async getProductSummary() {
    return get(API_ENDPOINTS.PRODUCTS.SUMMARY);
  },

  async getProductById(productId) {
    return get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
  },

  async createProduct(payload) {
    return post(API_ENDPOINTS.PRODUCTS.BASE, payload);
  },

  async updateProduct(productId, payload) {
    return patch(API_ENDPOINTS.PRODUCTS.DETAIL(productId), payload);
  },

  async changeProductStatus(productId, statusOrPayload) {
    const payload =
      typeof statusOrPayload === "string" ? { status: statusOrPayload } : statusOrPayload;
    return patch(API_ENDPOINTS.PRODUCTS.STATUS(productId), payload);
  },
};
