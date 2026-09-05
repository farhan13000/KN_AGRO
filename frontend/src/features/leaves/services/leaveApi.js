import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

const post = async (url, payload) => unwrapApiData(await apiClient.post(url, payload));

export const leaveApi = {
  async createLeave(payload) {
    return post(API_ENDPOINTS.LEAVES.BASE, payload);
  },

  // NOTE: GET /leaves/me's own query schema names this filter `type`,
  // while /leaves/team and GET /leaves (admin) both name the identical
  // filter `leaveType` — a real backend inconsistency, not a typo here;
  // confirmed directly against leave.validation.js's myLeaveQuerySchema
  // vs. leaveListQuerySchema/adminLeaveQuerySchema.
  async listMy(query) {
    const response = await apiClient.get(API_ENDPOINTS.LEAVES.ME, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listTeam(query) {
    const response = await apiClient.get(API_ENDPOINTS.LEAVES.TEAM, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listAll(query) {
    const response = await apiClient.get(API_ENDPOINTS.LEAVES.BASE, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  // managerComment optional on approve, per approveLeaveSchema.
  async approveLeave(leaveId, managerComment) {
    return post(API_ENDPOINTS.LEAVES.APPROVE(leaveId), managerComment ? { managerComment } : {});
  },

  // managerComment REQUIRED on reject, per rejectLeaveSchema.
  async rejectLeave(leaveId, managerComment) {
    return post(API_ENDPOINTS.LEAVES.REJECT(leaveId), { managerComment });
  },

  // cancellationReason REQUIRED, per cancelLeaveSchema.
  async cancelLeave(leaveId, cancellationReason) {
    return post(API_ENDPOINTS.LEAVES.CANCEL(leaveId), { cancellationReason });
  },
};
