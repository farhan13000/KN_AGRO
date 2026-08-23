import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { INVENTORY_ADJUSTMENT_TYPE } from "../constants";
import { cleanInventoryQuery } from "../utils";

const getMockInventoryApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE3_MOCK === "true")) {
    return null;
  }

  const { mockInventoryApi } = await import("../../../mocks/inventory/inventory.mock");
  return mockInventoryApi;
};

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanInventoryQuery(params) });
  return unwrapApiData(response);
};

const post = async (url, payload) => {
  const response = await apiClient.post(url, payload);
  return unwrapApiData(response);
};

export const inventoryApi = {
  async getInventory(query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getInventory(query);
    return get(API_ENDPOINTS.INVENTORY.BASE, query);
  },

  async getInventoryByProduct(productId) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getInventoryByProduct(productId);
    return get(API_ENDPOINTS.INVENTORY.DETAIL(productId));
  },

  async getTransactions(query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getTransactions(query);
    return get(API_ENDPOINTS.INVENTORY.TRANSACTIONS, query);
  },

  async getProductTransactions(productId, query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getProductTransactions(productId, query);
    return get(API_ENDPOINTS.INVENTORY.PRODUCT_TRANSACTIONS(productId), query);
  },

  async getLowStock(query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getLowStock(query);
    return get(API_ENDPOINTS.INVENTORY.LOW_STOCK, query);
  },

  async getOutOfStock(query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getOutOfStock(query);
    return get(API_ENDPOINTS.INVENTORY.OUT_OF_STOCK, query);
  },

  async getInventorySummary() {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getInventorySummary();
    return get(API_ENDPOINTS.INVENTORY.SUMMARY);
  },

  async getMovementsReport(query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getMovementsReport(query);
    return get(API_ENDPOINTS.INVENTORY.MOVEMENTS_REPORT, query);
  },

  async getValuationReport(query) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.getValuationReport(query);
    return get(API_ENDPOINTS.INVENTORY.VALUATION_REPORT, query);
  },

  async createOpeningStock(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.createOpeningStock(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.OPENING_STOCK(productId), payload);
  },

  async stockIn(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.stockIn(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.STOCK_IN(productId), payload);
  },

  async stockOut(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.stockOut(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.STOCK_OUT(productId), payload);
  },

  async adjustStock(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.adjustStock(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.ADJUST(productId), payload);
  },

  async adjustStockIn(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.adjustStockIn(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.ADJUST(productId), {
      ...payload,
      adjustmentType: INVENTORY_ADJUSTMENT_TYPE.INCREASE,
    });
  },

  async adjustStockOut(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.adjustStockOut(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.ADJUST(productId), {
      ...payload,
      adjustmentType: INVENTORY_ADJUSTMENT_TYPE.DECREASE,
    });
  },

  async markDamagedStock(productId, payload) {
    const mock = await getMockInventoryApi();
    if (mock) return mock.markDamagedStock(productId, payload);
    return post(API_ENDPOINTS.INVENTORY.DAMAGED(productId), payload);
  },
};
