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

/**
 * The recommended employee's own performance row, so an approver can see
 * what they are actually deciding on rather than just a reason string.
 *
 * Pulled from the manager-scoped performance table (the caller's whole
 * downline) and narrowed to one employee here — there is no per-employee
 * endpoint, and the approver is guaranteed to manage this employee
 * anyway, since the backend's approve() requires exactly that.
 */
export const useEmployeePerformanceRow = (employeeId, { enabled = true } = {}) => {
  const request = useCallback(async () => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.MANAGER_EMPLOYEE_PERFORMANCE);
    return unwrapApiData(response);
  }, []);

  const state = useAsyncResource(["analytics", "manager-employees"], request, {
    enabled: enabled && Boolean(employeeId),
  });

  const rows = state.data?.employees || [];
  return {
    ...state,
    performance: rows.find((row) => String(row.employee?._id) === String(employeeId)) || null,
  };
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
  assignPromotionManager: useAsyncMutation(promotionApi.assignPromotionManager, { onSuccess }),
  rejectPromotion: useAsyncMutation(promotionApi.rejectPromotion, { onSuccess }),
  cancelPromotion: useAsyncMutation(promotionApi.cancelPromotion, { onSuccess }),
});
