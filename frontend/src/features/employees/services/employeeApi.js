import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { cleanEmployeeQuery } from "../utils";

const getMockEmployeeApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_EMPLOYEE_MOCK === "true")) {
    return null;
  }

  const { mockEmployeeApi } = await import("../../../mocks/employees/employee.mock");
  return mockEmployeeApi;
};

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
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getEmployees(query);
    return get(API_ENDPOINTS.EMPLOYEES.BASE, query);
  },

  async getEmployeeById(employeeId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getEmployeeById(employeeId);
    return get(API_ENDPOINTS.EMPLOYEES.DETAIL(employeeId));
  },

  async createEmployee(payload) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.createEmployee(payload);
    return post(API_ENDPOINTS.EMPLOYEES.BASE, payload);
  },

  async updateEmployee(employeeId, payload) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.updateEmployee(employeeId, payload);
    return patch(API_ENDPOINTS.EMPLOYEES.DETAIL(employeeId), payload);
  },

  async getMyProfile() {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getMyProfile();
    return get(API_ENDPOINTS.EMPLOYEES.ME);
  },

  async updateMyProfile(payload) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.updateMyProfile(payload);
    return patch(API_ENDPOINTS.EMPLOYEES.ME, payload);
  },

  async getPendingEmployees(query) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getPendingEmployees(query);
    return get(API_ENDPOINTS.EMPLOYEES.PENDING, query);
  },

  async approveEmployee(employeeId, payload) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.approveEmployee(employeeId, payload);
    return patch(API_ENDPOINTS.EMPLOYEES.APPROVE(employeeId), payload);
  },

  async rejectEmployee(employeeId, payload) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.rejectEmployee(employeeId, payload);
    return patch(API_ENDPOINTS.EMPLOYEES.REJECT(employeeId), payload);
  },

  async assignManager(employeeId, managerId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.assignManager(employeeId, managerId);
    return patch(API_ENDPOINTS.EMPLOYEES.MANAGER(employeeId), { managerId });
  },

  async getDirectReports(employeeId, query) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getDirectReports(employeeId, query);
    return get(API_ENDPOINTS.EMPLOYEES.REPORTS(employeeId), query);
  },

  async getMyTeam(query) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getMyTeam(query);
    return get(API_ENDPOINTS.EMPLOYEES.MY_TEAM, query);
  },

  async deactivateEmployee(employeeId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.deactivateEmployee(employeeId);
    return patch(API_ENDPOINTS.EMPLOYEES.DEACTIVATE(employeeId));
  },

  async reactivateEmployee(employeeId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.reactivateEmployee(employeeId);
    return patch(API_ENDPOINTS.EMPLOYEES.REACTIVATE(employeeId));
  },

  async resignEmployee(employeeId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.resignEmployee(employeeId);
    return patch(API_ENDPOINTS.EMPLOYEES.RESIGN(employeeId));
  },

  async terminateEmployee(employeeId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.terminateEmployee(employeeId);
    return patch(API_ENDPOINTS.EMPLOYEES.TERMINATE(employeeId));
  },

  async promoteToManager(employeeId, roleId) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.promoteToManager(employeeId, roleId);
    return patch(API_ENDPOINTS.EMPLOYEES.PROMOTE(employeeId), { roleId });
  },

  async requestPromotion(employeeId, reason) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.requestPromotion(employeeId, reason);
    return post(API_ENDPOINTS.EMPLOYEES.PROMOTION_REQUEST(employeeId), { reason });
  },

  async getEmployeeHierarchy() {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getEmployeeHierarchy();
    return get(API_ENDPOINTS.EMPLOYEES.HIERARCHY);
  },

  async getEmployeeSummary() {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getEmployeeSummary();
    return get(API_ENDPOINTS.EMPLOYEES.SUMMARY);
  },

  async registerEmployee(payload) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.registerEmployee(payload);
    return post(API_ENDPOINTS.EMPLOYEES.REGISTER, payload);
  },

  async getActionRequests(query) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.getActionRequests(query);
    return get(API_ENDPOINTS.EMPLOYEE_ACTION_REQUESTS.BASE, query);
  },

  async approveActionRequest(requestId, reviewComment) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.approveActionRequest(requestId, reviewComment);
    return patch(API_ENDPOINTS.EMPLOYEE_ACTION_REQUESTS.APPROVE(requestId), { reviewComment });
  },

  async rejectActionRequest(requestId, reviewComment) {
    const mock = await getMockEmployeeApi();
    if (mock) return mock.rejectActionRequest(requestId, reviewComment);
    return patch(API_ENDPOINTS.EMPLOYEE_ACTION_REQUESTS.REJECT(requestId), { reviewComment });
  },
};
