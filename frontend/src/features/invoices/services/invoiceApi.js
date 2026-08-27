import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { pickCancelInvoicePayload, pickGenerateInvoicePayload, pickIssueInvoicePayload } from "../schemas";
import { cleanInvoiceQuery } from "../utils";

// No dev-mock gate: the Phase 6 invoices backend module is fully
// implemented. No updateInvoice method exists — no PATCH /invoices/:id
// route exists on the backend; totals/items are permanently frozen after
// creation, by design.

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanInvoiceQuery(params) });
  return unwrapApiData(response);
};

const post = async (url, payload) => {
  const response = await apiClient.post(url, payload);
  return unwrapApiData(response);
};

export const invoiceApi = {
  async getInvoices(query) {
    return get(API_ENDPOINTS.INVOICES.BASE, query);
  },

  async getInvoiceById(invoiceId) {
    return get(API_ENDPOINTS.INVOICES.DETAIL(invoiceId));
  },

  // Prompt 51: the one genuine, backend-aggregated total this phase has —
  // scoped to the acting user's own visibility, computed server-side over
  // every matching Invoice, never summed from a paginated page here.
  async getInvoiceSummary() {
    return get(API_ENDPOINTS.INVOICES.SUMMARY);
  },

  // Prompt 55: the dedicated, narrower print DTO (serializeInvoicePrintView)
  // — includes company letterhead info the regular detail response doesn't
  // carry, and omits internal/audit fields the regular detail response has.
  async getInvoicePrintView(invoiceId) {
    return get(API_ENDPOINTS.INVOICES.PRINT(invoiceId));
  },

  async generateInvoice(orderId, values) {
    const payload = pickGenerateInvoicePayload(values);
    return post(API_ENDPOINTS.INVOICES.FROM_ORDER(orderId), payload);
  },

  async issueInvoice(invoiceId, values) {
    const payload = pickIssueInvoicePayload(values);
    return post(API_ENDPOINTS.INVOICES.ISSUE(invoiceId), payload);
  },

  async cancelInvoice(invoiceId, reason) {
    const payload = pickCancelInvoicePayload(reason);
    return post(API_ENDPOINTS.INVOICES.CANCEL(invoiceId), payload);
  },
};
