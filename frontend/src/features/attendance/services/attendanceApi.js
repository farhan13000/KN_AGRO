import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

// checkIn/checkOut send exactly one thing: the photo reference returned
// by POST /media/uploads/ATTENDANCE_PHOTO. Everything else — the
// timestamp, workingMinutes, status — stays server-computed and has no
// field in the backend schema at all.
export const attendanceApi = {
  async checkIn(photo) {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, { photo });
    return unwrapApiData(response);
  },

  async checkOut(photo) {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, { photo });
    return unwrapApiData(response);
  },

  async getMyToday() {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.ME_TODAY);
    return unwrapApiData(response);
  },

  async getMySummary(month, year) {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.ME_SUMMARY, { params: { month, year } });
    return unwrapApiData(response);
  },

  async listMy(query) {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.ME, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async getTeamSummary(month, year) {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.TEAM_SUMMARY, { params: { month, year } });
    return unwrapApiData(response);
  },

  async listTeam(query) {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.TEAM, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listAll(query) {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.BASE, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async correctAttendance(attendanceId, payload) {
    const response = await apiClient.patch(API_ENDPOINTS.ATTENDANCE.CORRECT(attendanceId), payload);
    return unwrapApiData(response);
  },
};
