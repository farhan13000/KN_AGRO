import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import {
  pickCancelOrderPayload,
  pickCreateDirectOrderPayload,
  pickCreateOrderFromQuotationPayload,
} from "../schemas";
import { cleanOrderQuery } from "../utils";

// No dev-mock gate: the Phase 6 orders backend module is fully implemented
// (see docs_about_the_phase_completion/PHASE6_FRONTEND_API_CONTRACT.md).
//
// No orderApi.updateOrder/changeOrderStatus method exists here on purpose —
// the backend defines updateDraftOrderSchema/changeOrderStatusSchema but
// never wires either into a route. Every transition below is its own
// dedicated action endpoint; there is no generic PATCH to call.

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanOrderQuery(params) });
  return unwrapApiData(response);
};

const post = async (url, payload) => {
  const response = await apiClient.post(url, payload);
  return unwrapApiData(response);
};

export const orderApi = {
  async getOrders(query) {
    return get(API_ENDPOINTS.ORDERS.BASE, query);
  },

  async getOrderById(orderId) {
    return get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
  },

  async createDirectOrder(values) {
    return post(API_ENDPOINTS.ORDERS.BASE, pickCreateDirectOrderPayload(values));
  },

  async createOrderFromQuotation(quotationId, values) {
    const payload = pickCreateOrderFromQuotationPayload(values);
    return post(API_ENDPOINTS.ORDERS.FROM_QUOTATION(quotationId), payload);
  },

  async confirmOrder(orderId) {
    return post(API_ENDPOINTS.ORDERS.CONFIRM(orderId));
  },

  async markProcessing(orderId) {
    return post(API_ENDPOINTS.ORDERS.PROCESS(orderId));
  },

  async markReady(orderId) {
    return post(API_ENDPOINTS.ORDERS.READY(orderId));
  },

  async dispatchOrder(orderId) {
    return post(API_ENDPOINTS.ORDERS.DISPATCH(orderId));
  },

  async markDelivered(orderId) {
    return post(API_ENDPOINTS.ORDERS.DELIVER(orderId));
  },

  async cancelOrder(orderId, reason) {
    const payload = pickCancelOrderPayload(reason);
    return post(API_ENDPOINTS.ORDERS.CANCEL(orderId), payload);
  },

  // Org-hierarchy migration (backend Phase 11) — the backend's own scope
  // engine already picks the correct bucket for whoever calls this (an
  // RM gets their regional total, a GM gets company-wide, etc.); this
  // just returns whatever it sends back, no role branching here.
  async getAttributionRollup() {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.ATTRIBUTION);
    return unwrapApiData(response);
  },
};
