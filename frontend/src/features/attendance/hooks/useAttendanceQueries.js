import { useCallback, useMemo } from "react";
import { useAsyncMutation, useAsyncResource } from "../../../shared/hooks";
import { attendanceApi } from "../services";

const withDefaultQuery = (query) => ({ page: 1, limit: 20, ...query });

export const useMyAttendanceToday = (options) => {
  const request = useCallback(() => attendanceApi.getMyToday(), []);
  return useAsyncResource(["attendance", "me", "today"], request, options);
};

export const useMyAttendanceSummary = (month, year, options) => {
  const request = useCallback(() => attendanceApi.getMySummary(month, year), [month, year]);
  return useAsyncResource(["attendance", "me", "summary", month, year], request, options);
};

export const useMyAttendanceList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => attendanceApi.listMy(requestQuery), [requestQuery]);
  const state = useAsyncResource(["attendance", "me", "list", requestQuery], request, options);
  return { ...state, records: state.data?.attendance || [], pagination: state.data?.pagination || {} };
};

export const useTeamAttendanceSummary = (month, year, options) => {
  const request = useCallback(() => attendanceApi.getTeamSummary(month, year), [month, year]);
  return useAsyncResource(["attendance", "team", "summary", month, year], request, options);
};

export const useTeamAttendanceList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => attendanceApi.listTeam(requestQuery), [requestQuery]);
  const state = useAsyncResource(["attendance", "team", "list", requestQuery], request, options);
  return { ...state, records: state.data?.attendance || [], pagination: state.data?.pagination || {} };
};

export const useAllAttendanceList = (query = {}, options) => {
  const requestQuery = useMemo(() => withDefaultQuery(query), [query]);
  const request = useCallback(() => attendanceApi.listAll(requestQuery), [requestQuery]);
  const state = useAsyncResource(["attendance", "all", requestQuery], request, options);
  return { ...state, records: state.data?.attendance || [], pagination: state.data?.pagination || {} };
};

export const useAttendanceActions = ({ onSuccess } = {}) => ({
  checkIn: useAsyncMutation(attendanceApi.checkIn, { onSuccess }),
  checkOut: useAsyncMutation(attendanceApi.checkOut, { onSuccess }),
  correctAttendance: useAsyncMutation(
    (attendanceId, payload) => attendanceApi.correctAttendance(attendanceId, payload),
    { onSuccess },
  ),
});
