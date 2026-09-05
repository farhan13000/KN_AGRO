import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { reportRequestApi } from "../services";

const withDefaultQuery = (query) => ({ page: 1, limit: 20, ...query });

export const useMyReportRequestList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => reportRequestApi.listMy(requestQuery), [requestQuery]);
  const state = useAsyncResource(["reportRequests", "me", requestQuery], request, options);
  return { ...state, reportRequests: state.data?.reportRequests || [], pagination: state.data?.pagination || {} };
};

export const useTeamReportRequestList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => reportRequestApi.listTeam(requestQuery), [requestQuery]);
  const state = useAsyncResource(["reportRequests", "team", requestQuery], request, options);
  return { ...state, reportRequests: state.data?.reportRequests || [], pagination: state.data?.pagination || {} };
};

export const useAllReportRequestList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => reportRequestApi.listAll(requestQuery), [requestQuery]);
  const state = useAsyncResource(["reportRequests", "all", requestQuery], request, options);
  return { ...state, reportRequests: state.data?.reportRequests || [], pagination: state.data?.pagination || {} };
};

export const useReportRequestActions = ({ onSuccess } = {}) => ({
  createReportRequest: useAsyncMutation((payload) => reportRequestApi.createReportRequest(payload), { onSuccess }),
  startWork: useAsyncMutation((id) => reportRequestApi.startWork(id), { onSuccess }),
  submitReport: useAsyncMutation((id, payload) => reportRequestApi.submitReport(id, payload), { onSuccess }),
  resubmitReport: useAsyncMutation((id, payload) => reportRequestApi.resubmitReport(id, payload), { onSuccess }),
  reviewReport: useAsyncMutation((id, comment) => reportRequestApi.reviewReport(id, comment), { onSuccess }),
  rejectReport: useAsyncMutation((id, reason) => reportRequestApi.rejectReport(id, reason), { onSuccess }),
});
