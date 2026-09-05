import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

const post = async (url, payload) => unwrapApiData(await apiClient.post(url, payload));

export const reportRequestApi = {
  async createReportRequest(payload) {
    return post(API_ENDPOINTS.REPORT_REQUESTS.BASE, payload);
  },

  async listMy(query) {
    const response = await apiClient.get(API_ENDPOINTS.REPORT_REQUESTS.ME, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listTeam(query) {
    const response = await apiClient.get(API_ENDPOINTS.REPORT_REQUESTS.TEAM, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async listAll(query) {
    const response = await apiClient.get(API_ENDPOINTS.REPORT_REQUESTS.BASE, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async getSummary() {
    const response = await apiClient.get(API_ENDPOINTS.REPORT_REQUESTS.SUMMARY);
    return unwrapApiData(response);
  },

  // No body accepted by the backend for this one.
  async startWork(reportRequestId) {
    return post(API_ENDPOINTS.REPORT_REQUESTS.START(reportRequestId), {});
  },

  // payload: { submissionText, attachments? } — matches submitReportSchema
  // exactly; attachments (if given) are [{name?, url, publicId?, mimeType?, size?}],
  // metadata-only (no file upload integration exists in this codebase).
  async submitReport(reportRequestId, payload) {
    return post(API_ENDPOINTS.REPORT_REQUESTS.SUBMIT(reportRequestId), payload);
  },

  // Same body shape as submitReport, per resubmitReportSchema.
  async resubmitReport(reportRequestId, payload) {
    return post(API_ENDPOINTS.REPORT_REQUESTS.RESUBMIT(reportRequestId), payload);
  },

  // reviewComment optional, per reviewReportSchema.
  async reviewReport(reportRequestId, reviewComment) {
    return post(API_ENDPOINTS.REPORT_REQUESTS.REVIEW(reportRequestId), reviewComment ? { reviewComment } : {});
  },

  // rejectionReason REQUIRED, per rejectReportSchema.
  async rejectReport(reportRequestId, rejectionReason) {
    return post(API_ENDPOINTS.REPORT_REQUESTS.REJECT(reportRequestId), { rejectionReason });
  },
};
