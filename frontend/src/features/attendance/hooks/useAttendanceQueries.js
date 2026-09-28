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

/**
 * The daily report. Polls every two minutes: this screen is left open on
 * a desk all morning while people check in, and a list that silently goes
 * stale is worse than no list. Two minutes is slow enough to cost
 * nothing and fast enough that the counts can be trusted at a glance.
 */
export const useAttendanceDailyReport = (date, options) => {
  const request = useCallback(() => attendanceApi.getDailyReport(date), [date]);
  const state = useAsyncResource(["attendance", "daily-report", date || "today"], request, {
    refetchInterval: 120000,
    ...options,
  });

  return {
    ...state,
    report: state.data || null,
    checkedIn: state.data?.checkedIn || [],
    notCheckedIn: state.data?.notCheckedIn || [],
    summary: state.data?.summary || null,
  };
};

export const useEmployeeMonthlyAttendance = (employeeId, month, year, options) => {
  const request = useCallback(
    () => attendanceApi.getEmployeeMonthly(employeeId, month, year),
    [employeeId, month, year],
  );
  const state = useAsyncResource(
    ["attendance", "employee-monthly", employeeId, month, year],
    request,
    { enabled: Boolean(employeeId), ...options },
  );

  return { ...state, report: state.data || null, days: state.data?.days || [] };
};

export const useAttendanceActions = ({ onSuccess } = {}) => ({
  checkIn: useAsyncMutation(attendanceApi.checkIn, { onSuccess }),
  checkOut: useAsyncMutation(attendanceApi.checkOut, { onSuccess }),
  correctAttendance: useAsyncMutation(
    (attendanceId, payload) => attendanceApi.correctAttendance(attendanceId, payload),
    { onSuccess },
  ),
  requestReview: useAsyncMutation(
    (attendanceId, message) => attendanceApi.requestReview(attendanceId, message),
    { onSuccess },
  ),
  resolveReview: useAsyncMutation(
    (attendanceId, payload) => attendanceApi.resolveReview(attendanceId, payload),
    { onSuccess },
  ),
});
