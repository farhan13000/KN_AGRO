import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_FOLLOW_UP_QUERY, DEFAULT_LEAD_QUERY } from "../constants";
import { leadApi } from "../services";
import { leadQueryKeys } from "./leadQueryKeys";

const withDefaultLeadQuery = (query) => ({ ...DEFAULT_LEAD_QUERY, ...query });
const withDefaultFollowUpQuery = (query) => ({ ...DEFAULT_FOLLOW_UP_QUERY, ...query });

export const useLeadList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultLeadQuery(query), [query]);
  const request = useCallback(() => leadApi.getLeads(requestQuery), [requestQuery]);
  return useAsyncResource(leadQueryKeys.list(requestQuery), request, options);
};

export const useLeadDetail = (leadId, options) => {
  const request = useCallback(() => leadApi.getLeadById(leadId), [leadId]);
  return useAsyncResource(leadQueryKeys.detail(leadId), request, {
    enabled: Boolean(leadId) && options?.enabled !== false,
  });
};

export const useFollowUps = (kind = "today", query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultFollowUpQuery(query), [query]);
  const request = useCallback(() => leadApi.getFollowUps(kind, requestQuery), [kind, requestQuery]);
  return useAsyncResource(leadQueryKeys.followUps(kind, requestQuery), request, options);
};

export const useUnassignedLeads = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultFollowUpQuery(query), [query]);
  const request = useCallback(() => leadApi.getUnassignedLeads(requestQuery), [requestQuery]);
  return useAsyncResource(leadQueryKeys.unassigned(requestQuery), request, options);
};

export const useLeadSummary = (options) => {
  const request = useCallback(() => leadApi.getLeadSummary(), []);
  return useAsyncResource(leadQueryKeys.summary, request, options);
};

/**
 * Lead performance per employee, scoped by the backend to the caller.
 * Used by the team views, where a manager needs their reports' numbers
 * and cannot reach the ANALYTICS_ADMIN company-wide endpoint.
 */
export const useEmployeeLeadAnalytics = (query, options) => {
  const request = useCallback(() => leadApi.getEmployeeLeadAnalytics(query), [query]);
  return useAsyncResource(["leads", "analytics", "employees", query], request, options);
};

export const useLeadActions = ({ onError, onSuccess } = {}) => ({
  createLead: useAsyncMutation(leadApi.createLead, { onError, onSuccess }),
  updateLead: useAsyncMutation(leadApi.updateLead, { onError, onSuccess }),
  assignManager: useAsyncMutation(leadApi.assignManager, { onError, onSuccess }),
  assignEmployee: useAsyncMutation(leadApi.assignEmployee, { onError, onSuccess }),
  reassignManager: useAsyncMutation(leadApi.reassignManager, { onError, onSuccess }),
  reassignEmployee: useAsyncMutation(leadApi.reassignEmployee, { onError, onSuccess }),
  changeStatus: useAsyncMutation(leadApi.changeStatus, { onError, onSuccess }),
  changePriority: useAsyncMutation(leadApi.changePriority, { onError, onSuccess }),
  updateExpectedValue: useAsyncMutation(leadApi.updateExpectedValue, { onError, onSuccess }),
  updateInterestedProducts: useAsyncMutation(leadApi.updateInterestedProducts, { onError, onSuccess }),
  scheduleFollowUp: useAsyncMutation(leadApi.scheduleFollowUp, { onError, onSuccess }),
  completeFollowUp: useAsyncMutation(leadApi.completeFollowUp, { onError, onSuccess }),
  markLost: useAsyncMutation(leadApi.markLost, { onError, onSuccess }),
  closeLead: useAsyncMutation(leadApi.closeLead, { onError, onSuccess }),
  reopenLead: useAsyncMutation(leadApi.reopenLead, { onError, onSuccess }),
});
