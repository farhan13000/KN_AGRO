import { useCallback, useMemo } from "react";
import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { productRecommendationApi } from "../services";

// Same small, independent-copy pattern this migration already uses
// elsewhere (e.g. Promotion's own useRoleOptions) rather than reaching
// into a sibling feature for a generic /roles lookup.
export const useRoleOptions = ({ enabled = true } = {}) => {
  const request = useCallback(async () => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.BASE);
    return unwrapApiData(response);
  }, []);

  const state = useAsyncResource(["roles", "options"], request, { enabled });
  return { ...state, roles: state.data?.roles || [] };
};

export const useProductRecommendationList = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 50, ...query }), [query]);
  const request = useCallback(() => productRecommendationApi.listRecommendations(requestQuery), [requestQuery]);
  const state = useAsyncResource(["productRecommendations", "list", requestQuery], request, options);

  return {
    ...state,
    recommendations: state.data?.recommendations || [],
    pagination: state.data?.pagination || {},
  };
};

export const useProductRecommendationActions = ({ onSuccess } = {}) => ({
  createRecommendation: useAsyncMutation(productRecommendationApi.createRecommendation, { onSuccess }),
  approveRecommendation: useAsyncMutation(productRecommendationApi.approveRecommendation, { onSuccess }),
  archiveRecommendation: useAsyncMutation(productRecommendationApi.archiveRecommendation, { onSuccess }),
});
