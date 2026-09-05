import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { leaveApi } from "../services";

const withDefaultQuery = (query) => ({ page: 1, limit: 20, ...query });

export const useMyLeaveList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => leaveApi.listMy(requestQuery), [requestQuery]);
  const state = useAsyncResource(["leaves", "me", requestQuery], request, options);
  return { ...state, leaves: state.data?.leaves || [], pagination: state.data?.pagination || {} };
};

export const useTeamLeaveList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => leaveApi.listTeam(requestQuery), [requestQuery]);
  const state = useAsyncResource(["leaves", "team", requestQuery], request, options);
  return { ...state, leaves: state.data?.leaves || [], pagination: state.data?.pagination || {} };
};

export const useAllLeaveList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => leaveApi.listAll(requestQuery), [requestQuery]);
  const state = useAsyncResource(["leaves", "all", requestQuery], request, options);
  return { ...state, leaves: state.data?.leaves || [], pagination: state.data?.pagination || {} };
};

export const useLeaveActions = ({ onSuccess } = {}) => ({
  createLeave: useAsyncMutation((payload) => leaveApi.createLeave(payload), { onSuccess }),
  approveLeave: useAsyncMutation((leaveId, comment) => leaveApi.approveLeave(leaveId, comment), { onSuccess }),
  rejectLeave: useAsyncMutation((leaveId, comment) => leaveApi.rejectLeave(leaveId, comment), { onSuccess }),
  cancelLeave: useAsyncMutation((leaveId, reason) => leaveApi.cancelLeave(leaveId, reason), { onSuccess }),
});
