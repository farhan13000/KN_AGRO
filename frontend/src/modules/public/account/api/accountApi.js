import { API_ENDPOINTS } from "../../../../core/api/apiConfig";
import { accountClient, unwrapAccountData } from "./accountClient";

/**
 * Everything the website customer's own screens call.
 *
 * `submitEnquiry` lives here rather than with the other public APIs for a
 * specific reason: it goes through accountClient, which attaches the
 * customer's token only when there is one. One code path therefore serves
 * both cases — a guest enquiry sends no token and stays anonymous, while
 * a signed-in customer's enquiry is attributed to them by the backend and
 * shows up in their own history. The staff apiClient could never do that:
 * it would attach an employee's token to a customer's enquiry.
 */
export const accountApi = {
  async register(payload) {
    const response = await accountClient.post(API_ENDPOINTS.ACCOUNT.REGISTER, payload);
    return unwrapAccountData(response);
  },

  async login(identifier, password) {
    const response = await accountClient.post(API_ENDPOINTS.ACCOUNT.LOGIN, { identifier, password });
    return unwrapAccountData(response);
  },

  async logout() {
    const response = await accountClient.post(API_ENDPOINTS.ACCOUNT.LOGOUT);
    return unwrapAccountData(response);
  },

  async getProfile() {
    const response = await accountClient.get(API_ENDPOINTS.ACCOUNT.ME);
    return unwrapAccountData(response);
  },

  async updateProfile(payload) {
    const response = await accountClient.patch(API_ENDPOINTS.ACCOUNT.ME, payload);
    return unwrapAccountData(response);
  },

  async getMyEnquiries(params) {
    const response = await accountClient.get(API_ENDPOINTS.ACCOUNT.MY_ENQUIRIES, { params });
    return unwrapAccountData(response);
  },

  async getMyOrders(params) {
    const response = await accountClient.get(API_ENDPOINTS.ACCOUNT.MY_ORDERS, { params });
    return unwrapAccountData(response);
  },

  async reorder(orderId, message) {
    const response = await accountClient.post(API_ENDPOINTS.ACCOUNT.REORDER(orderId), { message });
    return unwrapAccountData(response);
  },

  async submitEnquiry(payload) {
    const response = await accountClient.post(API_ENDPOINTS.PUBLIC.ENQUIRIES, payload);
    return unwrapAccountData(response);
  },
};

export default accountApi;
