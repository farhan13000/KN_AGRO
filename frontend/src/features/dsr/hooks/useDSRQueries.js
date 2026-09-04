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

export const useTeamDSRList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => dsrApi.listTeamDSRs(requestQuery), [requestQuery]);
  const state = useAsyncResource(["dsr", "team", requestQuery], request, options);
  return { ...state, dsrs: state.data?.dsrs || [], pagination: state.data?.pagination || {} };
};

export const useAllDSRList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => dsrApi.listAllDSRs(requestQuery), [requestQuery]);
  const state = useAsyncResource(["dsr", "all", requestQuery], request, options);
  return { ...state, dsrs: state.data?.dsrs || [], pagination: state.data?.pagination || {} };
};

export const useDSRActions = ({ onSuccess } = {}) => ({
  submitDSR: useAsyncMutation(dsrApi.submitDSR, { onSuccess }),
  reviewDSR: useAsyncMutation(dsrApi.reviewDSR, { onSuccess }),
  acknowledgeDSR: useAsyncMutation(dsrApi.acknowledgeDSR, { onSuccess }),
});
