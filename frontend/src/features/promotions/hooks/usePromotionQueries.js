import { useCallback, useMemo } from "react";
import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { promotionApi } from "../services";

/**
 * Selectable roles for the promotion/hiring role pickers.
 *
 * Deliberately NOT filtered to "the next tier up" — the promotion
 * approver matrix lives only in the backend, and re-deriving it here
 * would mean two sources of truth. An invalid pair comes back as the
 * backend's own 400 ("No configured promotion path from X to Y"), which
 * the dialog surfaces verbatim.
 */
export const useRoleOptions = ({ enabled = true } = {}) => {
  const request = useCallback(async () => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.BASE);
    return unwrapApiData(response);
  }, []);

  const state = useAsyncResource(["roles", "options"], request, { enabled });
  return { ...state, roles: state.data?.roles || [] };
};

export const usePromotionList = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 50, ...query }), [query]);
  const request = useCallback(() => promotionApi.listPromotions(requestQuery), [requestQuery]);
  const state = useAsyncResource(["promotions", "list", requestQuery], request, options);

  return {
    ...state,
    promotions: state.data?.promotions || [],
    pagination: state.data?.pagination || {},
  };
};

export const usePromotionActions = ({ onSuccess } = {}) => ({
  recommendPromotion: useAsyncMutation(promotionApi.recommendPromotion, { onSuccess }),
  approvePromotion: useAsyncMutation(promotionApi.approvePromotion, { onSuccess }),
  rejectPromotion: useAsyncMutation(promotionApi.rejectPromotion, { onSuccess }),
  cancelPromotion: useAsyncMutation(promotionApi.cancelPromotion, { onSuccess }),
});
