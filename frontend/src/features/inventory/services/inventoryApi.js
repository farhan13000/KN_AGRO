import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { INVENTORY_ADJUSTMENT_TYPE } from "../constants";
import { cleanInventoryQuery } from "../utils";

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
    return get(API_ENDPOINTS.INVENTORY.BASE, query);
  },

  async getInventoryByProduct(productId) {
    return get(API_ENDPOINTS.INVENTORY.DETAIL(productId));
  },

  async getTransactions(query) {
    return get(API_ENDPOINTS.INVENTORY.TRANSACTIONS, query);
  },

  async getProductTransactions(productId, query) {
    return get(API_ENDPOINTS.INVENTORY.PRODUCT_TRANSACTIONS(productId), query);
  },

  async getLowStock(query) {
    return get(API_ENDPOINTS.INVENTORY.LOW_STOCK, query);
  },

  async getOutOfStock(query) {
    return get(API_ENDPOINTS.INVENTORY.OUT_OF_STOCK, query);
  },

  async getInventorySummary() {
    return get(API_ENDPOINTS.INVENTORY.SUMMARY);
  },

  async getMovementsReport(query) {
    return get(API_ENDPOINTS.INVENTORY.MOVEMENTS_REPORT, query);
  },

  async getValuationReport(query) {
    return get(API_ENDPOINTS.INVENTORY.VALUATION_REPORT, query);
  },

  async createOpeningStock(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.OPENING_STOCK(productId), payload);
  },

  async stockIn(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.STOCK_IN(productId), payload);
  },

  async stockOut(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.STOCK_OUT(productId), payload);
  },

  async adjustStock(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.ADJUST(productId), payload);
  },

  async adjustStockIn(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.ADJUST(productId), {
      ...payload,
      adjustmentType: INVENTORY_ADJUSTMENT_TYPE.INCREASE,
    });
  },

  async adjustStockOut(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.ADJUST(productId), {
      ...payload,
      adjustmentType: INVENTORY_ADJUSTMENT_TYPE.DECREASE,
    });
  },

  async markDamagedStock(productId, payload) {
    return post(API_ENDPOINTS.INVENTORY.DAMAGED(productId), payload);
  },
};
