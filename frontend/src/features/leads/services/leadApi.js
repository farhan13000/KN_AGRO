import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import {
  pickCompleteFollowUpPayload,
  pickCreateLeadPayload,
  pickPriorityPayload,
  pickPublicEnquiryPayload,
  pickReopenPayload,
  pickScheduleFollowUpPayload,
  pickStatusPayload,
  pickUpdateLeadPayload,
} from "../schemas";
import { cleanLeadQuery } from "../utils";

const getMockLeadApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE4_MOCK === "true")) {
    return null;
  }

  const { mockLeadApi } = await import("../../../mocks/leads/lead.mock");
  return mockLeadApi;
};

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanLeadQuery(params) });
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

export const leadApi = {
  async submitPublicEnquiry(values) {
    const mock = await getMockLeadApi();
    const payload = pickPublicEnquiryPayload(values);
    if (mock) return mock.submitPublicEnquiry(payload);
    return post(API_ENDPOINTS.PUBLIC.ENQUIRIES, payload);
  },

  async getLeads(query) {
    const mock = await getMockLeadApi();
    if (mock) return mock.getLeads(query);
    return get(API_ENDPOINTS.LEADS.BASE, query);
  },

  async getLeadById(leadId) {
    const mock = await getMockLeadApi();
    if (mock) return mock.getLeadById(leadId);
    return get(API_ENDPOINTS.LEADS.DETAIL(leadId));
  },

  async createLead(values) {
    const mock = await getMockLeadApi();
    const payload = pickCreateLeadPayload(values);
    if (mock) return mock.createLead(payload);
    return post(API_ENDPOINTS.LEADS.BASE, payload);
  },

  async updateLead(leadId, values) {
    const mock = await getMockLeadApi();
    const payload = pickUpdateLeadPayload(values);
    if (mock) return mock.updateLead(leadId, payload);
    return patch(API_ENDPOINTS.LEADS.DETAIL(leadId), payload);
  },

  async assignManager(leadId, managerId) {
    const mock = await getMockLeadApi();
    if (mock) return mock.assignManager(leadId, managerId);
    return patch(API_ENDPOINTS.LEADS.MANAGER(leadId), { managerId: managerId || null });
  },

  async assignEmployee(leadId, employeeId) {
    const mock = await getMockLeadApi();
    if (mock) return mock.assignEmployee(leadId, employeeId);
    return patch(API_ENDPOINTS.LEADS.EMPLOYEE(leadId), { employeeId: employeeId || null });
  },

  async reassignManager(leadId, managerId) {
    return leadApi.assignManager(leadId, managerId);
  },

  async reassignEmployee(leadId, employeeId) {
    return leadApi.assignEmployee(leadId, employeeId);
  },

  async changeStatus(leadId, values) {
    const mock = await getMockLeadApi();
    const payload = typeof values === "string" ? { status: values } : pickStatusPayload(values);
    if (mock) return mock.changeStatus(leadId, payload);
    return patch(API_ENDPOINTS.LEADS.STATUS(leadId), payload);
  },

  async changePriority(leadId, values) {
    const mock = await getMockLeadApi();
    const payload = typeof values === "string" ? { priority: values } : pickPriorityPayload(values);
    if (mock) return mock.changePriority(leadId, payload);
    return patch(API_ENDPOINTS.LEADS.PRIORITY(leadId), payload);
  },

  async updateExpectedValue(leadId, expectedValue) {
    return leadApi.updateLead(leadId, { expectedValue });
  },

  async updateInterestedProducts(leadId, interestedProducts) {
    return leadApi.updateLead(leadId, { interestedProducts });
  },

  async scheduleFollowUp(leadId, values) {
    const mock = await getMockLeadApi();
    const payload = pickScheduleFollowUpPayload(values);
    if (mock) return mock.scheduleFollowUp(leadId, payload);
    return post(API_ENDPOINTS.LEADS.FOLLOW_UPS(leadId), payload);
  },

  async completeFollowUp(leadId, values) {
    const mock = await getMockLeadApi();
    const payload = pickCompleteFollowUpPayload(values);
    if (mock) return mock.completeFollowUp(leadId, payload);
    return post(API_ENDPOINTS.LEADS.COMPLETE_FOLLOW_UP(leadId), payload);
  },

  async markLost(leadId, reason) {
    return leadApi.changeStatus(leadId, { status: "LOST", reason });
  },

  async closeLead(leadId) {
    return leadApi.changeStatus(leadId, { status: "CLOSED" });
  },

  async reopenLead(leadId, values) {
    const mock = await getMockLeadApi();
    const payload = pickReopenPayload(values);
    if (mock) return mock.reopenLead(leadId, payload);
    return patch(API_ENDPOINTS.LEADS.REOPEN(leadId), payload);
  },

  async getFollowUps(kind = "today", query) {
    const mock = await getMockLeadApi();
    if (mock) return mock.getFollowUps(kind, query);
    const endpointByKind = {
      today: API_ENDPOINTS.LEADS.FOLLOW_UPS_TODAY,
      overdue: API_ENDPOINTS.LEADS.FOLLOW_UPS_OVERDUE,
      upcoming: API_ENDPOINTS.LEADS.FOLLOW_UPS_UPCOMING,
    };
    return get(endpointByKind[kind] || endpointByKind.today, query);
  },

  async getUnassignedLeads(query) {
    const mock = await getMockLeadApi();
    if (mock) return mock.getUnassignedLeads(query);
    return get(API_ENDPOINTS.LEADS.UNASSIGNED, query);
  },

  async getLeadSummary() {
    const mock = await getMockLeadApi();
    if (mock) return mock.getLeadSummary();
    return get(API_ENDPOINTS.LEADS.SUMMARY);
  },
};
