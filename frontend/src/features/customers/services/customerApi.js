import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { pickChangeCustomerStatusPayload, pickCreateCustomerPayload, pickUpdateCustomerPayload } from "../schemas";
import { cleanCustomerQuery } from "../utils";

// No dev-mock gate: the Phase 6 customers backend module is fully
// implemented (see docs_about_the_phase_completion/PHASE6_FRONTEND_API_CONTRACT.md).

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanCustomerQuery(params) });
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

export const customerApi = {
  async getCustomers(query) {
    return get(API_ENDPOINTS.CUSTOMERS.BASE, query);
  },

  async getCustomerById(customerId) {
    return get(API_ENDPOINTS.CUSTOMERS.DETAIL(customerId));
  },

  // Returns { customer, leads, quotations, orders, invoices, payments } —
  // each of the latter five as { count, latest: [...5 most recent...] },
  // never a full/paginated list and never an authoritative aggregate total
  // (there is no "customer outstanding total" field anywhere in this
  // response). CustomerDetailView must never sum `latest` and present it
  // as a complete Outstanding figure — see its own doc comment.
  async getCustomerHistory(customerId) {
    return get(API_ENDPOINTS.CUSTOMERS.HISTORY(customerId));
  },

  async createCustomer(values) {
    const payload = pickCreateCustomerPayload(values);
    return post(API_ENDPOINTS.CUSTOMERS.BASE, payload);
  },

  async updateCustomer(customerId, values) {
    const payload = pickUpdateCustomerPayload(values);
    return patch(API_ENDPOINTS.CUSTOMERS.DETAIL(customerId), payload);
  },

  async changeCustomerStatus(customerId, values) {
    const payload = pickChangeCustomerStatusPayload(values);
    return patch(API_ENDPOINTS.CUSTOMERS.STATUS(customerId), payload);
  },
};
