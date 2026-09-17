import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanEmployeeQuery } from "../utils";

const get = async (url, params) => {
  const response = await apiClient.get(url, { params: cleanEmployeeQuery(params) });
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

export const employeeApi = {
  async getEmployees(query) {
    return get(API_ENDPOINTS.EMPLOYEES.BASE, query);
  },

  async getEmployeeById(employeeId) {
    return get(API_ENDPOINTS.EMPLOYEES.DETAIL(employeeId));
  },

  async createEmployee(payload) {
    return post(API_ENDPOINTS.EMPLOYEES.BASE, payload);
  },

  async updateEmployee(employeeId, payload) {
    return patch(API_ENDPOINTS.EMPLOYEES.DETAIL(employeeId), payload);
  },

  async getMyProfile() {
    return get(API_ENDPOINTS.EMPLOYEES.ME);
  },

  async updateMyProfile(payload) {
    return patch(API_ENDPOINTS.EMPLOYEES.ME, payload);
  },

  async getPendingEmployees(query) {
    return get(API_ENDPOINTS.EMPLOYEES.PENDING, query);
  },

  async approveEmployee(employeeId, payload) {
    return patch(API_ENDPOINTS.EMPLOYEES.APPROVE(employeeId), payload);
  },

  async rejectEmployee(employeeId, payload) {
    return patch(API_ENDPOINTS.EMPLOYEES.REJECT(employeeId), payload);
  },

  async assignManager(employeeId, managerId) {
    return patch(API_ENDPOINTS.EMPLOYEES.MANAGER(employeeId), { managerId });
  },

  async getDirectReports(employeeId, query) {
    return get(API_ENDPOINTS.EMPLOYEES.REPORTS(employeeId), query);
  },

  async getMyTeam(query) {
    return get(API_ENDPOINTS.EMPLOYEES.MY_TEAM, query);
  },

  async deactivateEmployee(employeeId) {
    return patch(API_ENDPOINTS.EMPLOYEES.DEACTIVATE(employeeId));
  },

  async reactivateEmployee(employeeId) {
    return patch(API_ENDPOINTS.EMPLOYEES.REACTIVATE(employeeId));
  },

  async resignEmployee(employeeId) {
    return patch(API_ENDPOINTS.EMPLOYEES.RESIGN(employeeId));
  },

  async terminateEmployee(employeeId) {
    return patch(API_ENDPOINTS.EMPLOYEES.TERMINATE(employeeId));
  },

  async requestPromotion(employeeId, reason) {
    return post(API_ENDPOINTS.EMPLOYEES.PROMOTION_REQUEST(employeeId), { reason });
  },

  async getEmployeeHierarchy() {
    return get(API_ENDPOINTS.EMPLOYEES.HIERARCHY);
  },

  // A transfer is how manager/coverage change on an existing employee
  // (the update endpoint's coverage change is silent; this one instead
  // writes an immutable history record alongside the change).
  async transferEmployee(employeeId, payload) {
    return post(API_ENDPOINTS.EMPLOYEES.TRANSFER(employeeId), payload);
  },

  async listTransfers(employeeId, query) {
    return get(API_ENDPOINTS.EMPLOYEES.TRANSFERS(employeeId), query);
  },

  async getEmployeeSummary() {
    return get(API_ENDPOINTS.EMPLOYEES.SUMMARY);
  },

  async getActionRequests(query) {
    return get(API_ENDPOINTS.EMPLOYEE_ACTION_REQUESTS.BASE, query);
  },

  async approveActionRequest(requestId, reviewComment) {
    return patch(API_ENDPOINTS.EMPLOYEE_ACTION_REQUESTS.APPROVE(requestId), { reviewComment });
  },

  async rejectActionRequest(requestId, reviewComment) {
    return patch(API_ENDPOINTS.EMPLOYEE_ACTION_REQUESTS.REJECT(requestId), { reviewComment });
  },
};
