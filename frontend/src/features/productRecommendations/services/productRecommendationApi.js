import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const emptyValues = new Set(["", null, undefined]);
const cleanQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

const post = async (url, payload) => unwrapApiData(await apiClient.post(url, payload));

export const productRecommendationApi = {
  async createRecommendation({ product, targetRole, targetTeam, targetArea, reason }) {
    return post(API_ENDPOINTS.PRODUCT_RECOMMENDATIONS.BASE, {
      product,
      ...(targetRole ? { targetRole } : {}),
      ...(targetTeam ? { targetTeam } : {}),
      ...(targetArea ? { targetArea } : {}),
      reason,
    });
  },

  // The ONE list endpoint — the backend's own listVisibleTo already
  // returns a different shape depending on who's asking (approval
  // authority sees everything including every DRAFT; everyone else sees
  // only APPROVED + targeted-at-them + their own drafts). No separate
  // "manage" vs "visible to me" endpoint exists; render whatever comes
  // back, no client-side re-filtering.
  async listRecommendations(query) {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT_RECOMMENDATIONS.BASE, { params: cleanQuery(query) });
    return unwrapApiData(response);
  },

  async approveRecommendation(recommendationId) {
    return post(API_ENDPOINTS.PRODUCT_RECOMMENDATIONS.APPROVE(recommendationId), {});
  },

  async archiveRecommendation(recommendationId) {
    return post(API_ENDPOINTS.PRODUCT_RECOMMENDATIONS.ARCHIVE(recommendationId), {});
  },
};
