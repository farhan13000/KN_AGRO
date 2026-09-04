import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { hiringApi } from "../services";

export const useHiringRequestList = (query = {}, options) => {
  const requestQuery = useMemo(() => ({ page: 1, limit: 50, ...query }), [query]);
  const request = useCallback(() => hiringApi.listHiringRequests(requestQuery), [requestQuery]);
  const state = useAsyncResource(["hiring", "list", requestQuery], request, options);

  return {
    ...state,
    requests: state.data?.requests || [],
    pagination: state.data?.pagination || {},
  };
};

export const useHiringRequestDetail = (requestId, options) => {
  const request = useCallback(() => hiringApi.getHiringRequest(requestId), [requestId]);
  const state = useAsyncResource(["hiring", "detail", requestId], request, {
    enabled: Boolean(requestId) && options?.enabled !== false,
  });

  return { ...state, request: state.data?.request || null };
};

export const useHiringActions = ({ onSuccess } = {}) => ({
  createHiringRequest: useAsyncMutation(hiringApi.createHiringRequest, { onSuccess }),
  processHiringRequest: useAsyncMutation(hiringApi.processHiringRequest, { onSuccess }),
  reviewHiringRequest: useAsyncMutation(hiringApi.reviewHiringRequest, { onSuccess }),
  approveHiringRequest: useAsyncMutation(hiringApi.approveHiringRequest, { onSuccess }),
  rejectHiringRequest: useAsyncMutation(hiringApi.rejectHiringRequest, { onSuccess }),
  completeHiringRequest: useAsyncMutation(hiringApi.completeHiringRequest, { onSuccess }),
});
