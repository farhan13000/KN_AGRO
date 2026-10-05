import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { dsrApi } from "../services";

const withDefaultQuery = (query) => ({ page: 1, limit: 20, ...query });

export const useMyDSRList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => dsrApi.listMyDSRs(requestQuery), [requestQuery]);
  const state = useAsyncResource(["dsr", "me", requestQuery], request, options);
  return { ...state, dsrs: state.data?.dsrs || [], pagination: state.data?.pagination || {} };
};

export const useMyDSRDraft = (options) => {
  const request = useCallback(() => dsrApi.getMyDSRDraft(), []);
  return useAsyncResource(["dsr", "me", "draft"], request, options);
};

export const useTeamDSRList =(query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => dsrApi.listTeamDSRs(requestQuery), [requestQuery]);
  const state = useAsyncResource(["dsr", "team", requestQuery], request, options);
  return { ...state, dsrs: state.data?.dsrs || [], pagination: state.data?.pagination || {} };
};

/**
 * Polled like the attendance daily report, and for the same reason: this
 * screen is left open on a desk through the evening while reports come
 * in, and a list that needs a manual refresh to show them is a list
 * somebody stops trusting.
 */
export const useDSRDailyReport = (date, options) => {
  const request = useCallback(() => dsrApi.getDailyReport(date), [date]);
  const state = useAsyncResource(["dsr", "daily-report", date || "today"], request, {
    refetchInterval: 120000,
    ...options,
  });

  return {
    ...state,
    report: state.data || null,
    submitted: state.data?.submitted || [],
    notSubmitted: state.data?.notSubmitted || [],
    summary: state.data?.summary || null,
  };
};

export const useAllDSRList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => dsrApi.listAllDSRs(requestQuery), [requestQuery]);
  const state = useAsyncResource(["dsr", "all", requestQuery], request, options);
  return { ...state, dsrs: state.data?.dsrs || [], pagination: state.data?.pagination || {} };
};

export const useDSRDetail = (dsrId, options) => {
  const request = useCallback(() => dsrApi.getDSR(dsrId), [dsrId]);
  return useAsyncResource(["dsr", "detail", dsrId], request, { enabled: Boolean(dsrId), ...options });
};

export const useDSRActions =({ onSuccess } = {}) => ({
  submitDSR: useAsyncMutation(dsrApi.submitDSR, { onSuccess }),
  reviewDSR: useAsyncMutation(dsrApi.reviewDSR, { onSuccess }),
  acknowledgeDSR: useAsyncMutation(dsrApi.acknowledgeDSR, { onSuccess }),
});
