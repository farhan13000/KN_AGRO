import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import {
  pickCancelQuotationPayload,
  pickCreateQuotationPayload,
  pickRejectQuotationPayload,
  pickUpdateQuotationPayload,
} from "../schemas";
import { cleanQuotationQuery } from "../utils";

// No dev-mock gate here: the Phase 5 quotations backend module is fully
// implemented (see docs_about_the_phase_completion/PHASE5_FRONTEND_API_CONTRACT.md),
// so this service talks to the real API directly, unlike Phase 3/4 features.

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanQuotationQuery(params) });
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

export const quotationApi = {
  async getQuotations(query) {
    return get(API_ENDPOINTS.QUOTATIONS.BASE, query);
  },

  async getQuotationById(quotationId) {
    return get(API_ENDPOINTS.QUOTATIONS.DETAIL(quotationId));
  },

  async getQuotationsForLead(leadId, query) {
    return get(API_ENDPOINTS.LEADS.QUOTATIONS(leadId), query);
  },

  async getQuotationPrintView(quotationId) {
    return get(API_ENDPOINTS.QUOTATIONS.PRINT(quotationId));
  },

  async createQuotation(values) {
    const payload = pickCreateQuotationPayload(values);
    return post(API_ENDPOINTS.QUOTATIONS.BASE, payload);
  },

  async updateQuotation(quotationId, values) {
    const payload = pickUpdateQuotationPayload(values);
    return patch(API_ENDPOINTS.QUOTATIONS.DETAIL(quotationId), payload);
  },

  async sendQuotation(quotationId) {
    return post(API_ENDPOINTS.QUOTATIONS.SEND(quotationId));
  },

  async acceptQuotation(quotationId) {
    return post(API_ENDPOINTS.QUOTATIONS.ACCEPT(quotationId));
  },

  async rejectQuotation(quotationId, reason) {
    const payload = pickRejectQuotationPayload(reason);
    return post(API_ENDPOINTS.QUOTATIONS.REJECT(quotationId), payload);
  },

  async cancelQuotation(quotationId, reason) {
    const payload = pickCancelQuotationPayload(reason);
    return post(API_ENDPOINTS.QUOTATIONS.CANCEL(quotationId), payload);
  },

  async reviseQuotation(quotationId) {
    return post(API_ENDPOINTS.QUOTATIONS.REVISE(quotationId));
  },
};
