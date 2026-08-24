import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { DEFAULT_LEAD_ACTIVITY_QUERY } from "../constants";
import { leadActivityApi } from "../services";
import { leadActivityQueryKeys } from "./leadActivityQueryKeys";

const withDefaultActivityQuery = (query) => ({ ...DEFAULT_LEAD_ACTIVITY_QUERY, ...query });

export const useLeadActivityTimeline = (leadId, query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultActivityQuery(query), [query]);
  const request = useCallback(
    () => leadActivityApi.getLeadActivities(leadId, requestQuery),
    [leadId, requestQuery],
  );
  return useAsyncResource(leadActivityQueryKeys.timeline(leadId, requestQuery), request, {
    enabled: Boolean(leadId) && options?.enabled !== false,
  });
};

export const useLeadActivityActions = ({ onError, onSuccess } = {}) => ({
  createManualActivity: useAsyncMutation(leadActivityApi.createManualActivity, { onError, onSuccess }),
});
