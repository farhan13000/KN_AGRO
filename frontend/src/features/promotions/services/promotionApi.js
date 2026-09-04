import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);

const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const promotionApi = {
  /**
   * Holding PROMOTION_RECOMMEND is necessary but not sufficient — the
   * backend additionally checks the actor's role tier against the
   * approver matrix AND that they actually manage this employee, so a
   * 403 here is an expected, explainable outcome rather than a bug.
   */
  async recommendPromotion(employeeId, proposedRoleId, reason) {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.BASE, {
      employeeId,
      proposedRoleId,
      reason,
    });
    return unwrapApiData(response);
  },

  async listPromotions(query) {
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.BASE, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async getPromotion(promotionId) {
    const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.DETAIL(promotionId));
    return unwrapApiData(response);
  },

  // Comment is optional on approve, but REQUIRED on reject (the backend's
  // rejectPromotionSchema enforces a non-empty comment).
  async approvePromotion(promotionId, comment) {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.APPROVE(promotionId), { comment });
    return unwrapApiData(response);
  },

  async rejectPromotion(promotionId, comment) {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.REJECT(promotionId), { comment });
    return unwrapApiData(response);
  },

  // Only the original recommender may cancel, and only while the
  // promotion is still RECOMMENDED.
  async cancelPromotion(promotionId) {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.CANCEL(promotionId), {});
    return unwrapApiData(response);
  },
};
