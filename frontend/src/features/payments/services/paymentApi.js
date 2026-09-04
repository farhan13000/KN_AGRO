import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { pickRecordPaymentPayload } from "../schemas";
import { cleanPaymentQuery } from "../utils";

// No dev-mock gate: the Phase 6 payments backend module is fully
// implemented. No getPaymentById method exists — confirmed directly from
// payment.routes.js that no `GET /payments/:id` route exists at all, only
// the global list and the invoice-scoped list/record routes below.
//
// No updatePayment/deletePayment/reversePayment method exists here, ever —
// Payments are genuinely append-only, enforced both by the absence of any
// PATCH/DELETE route and by Mongoose pre-hooks on the backend model itself
// that throw on any mutation attempt.
//
// No createCheckout/createPaymentIntent/verifyGatewayPayment/
// handlePaymentWebhook — this module is manual/offline recording only,
// per phase6.md's explicit "No Payment Gateway Rule".

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanPaymentQuery(params) });
  return unwrapApiData(response);
};

const post = async (url, payload) => {
  const response = await apiClient.post(url, payload);
  return unwrapApiData(response);
};

export const paymentApi = {
  async getPayments(query) {
    return get(API_ENDPOINTS.PAYMENTS.BASE, query);
  },

  async getInvoicePayments(invoiceId, query) {
    return get(API_ENDPOINTS.INVOICES.PAYMENTS(invoiceId), query);
  },

  async recordPayment(invoiceId, values) {
    const payload = pickRecordPaymentPayload(values);
    return post(API_ENDPOINTS.INVOICES.PAYMENTS(invoiceId), payload);
  },
};
