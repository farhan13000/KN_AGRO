import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

// checkIn/checkOut send exactly four things: the selfie and meter photo
// references returned by POST /media/uploads/ATTENDANCE_PHOTO, the meter
// reading as a number, and the device location. The time, status and half-day decision stay
// server-computed and have no field in the backend schema at all.
export const attendanceApi = {
  async checkIn({ selfie, meterPhoto, meterReading, location }) {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, { selfie, meterPhoto, meterReading, location });
    return unwrapApiData(response);
  },

  async checkOut({ selfie, meterPhoto, meterReading, location }) {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, { selfie, meterPhoto, meterReading, location });
    return unwrapApiData(response);
  },

  async requestReview(attendanceId, message) {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.REVIEW_REQUEST(attendanceId), { message });
    return unwrapApiData(response);
  },

  async resolveReview(attendanceId, { decision, note }) {
    const response = await apiClient.patch(API_ENDPOINTS.ATTENDANCE.REVIEW(attendanceId), { decision, note });
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
