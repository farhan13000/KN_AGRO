import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAsyncResource } from "../../../shared/hooks";
import { leadActionRequestApi } from "../services/leadActionRequestApi";

/**
 * The "please do this" requests on one lead.
 *
 * Two places need them and must agree: the next-step panel (which turns
 * "ask your manager for a quotation" into the lead's next step, and has
 * to know whether it has already been asked) and the requests list
 * (which shows every open one). Sharing this hook means they share one
 * request and one cache entry rather than each fetching the same rows
 * and drifting a refresh apart.
 */
export const leadActionRequestsKey = (leadId) => ["lead-action-requests", leadId];

export const useLeadActionRequests = (leadId, { enabled = true } = {}) => {
  const request = useCallback(() => leadActionRequestApi.list({ leadId }), [leadId]);
  const state = useAsyncResource(leadActionRequestsKey(leadId), request, {
    enabled: enabled && Boolean(leadId),
  });

  const requests = state.data?.requests || [];
  const pending = requests.filter((item) => item.status === "PENDING");

  return {
    ...state,
    pending,
    pendingTypes: pending.map((item) => item.type),
    requests,
  };
};

/**
 * Refreshes that shared list from anywhere — used after one component
 * creates a request so the OTHER one stops offering it a second later.
 */
export const useRefreshLeadActionRequests = (leadId) => {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: leadActionRequestsKey(leadId) }),
    [leadId, queryClient]
  );
};
