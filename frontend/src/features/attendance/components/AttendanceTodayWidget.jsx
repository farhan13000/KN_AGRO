import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import Card from "../../../shared/components/Card";
import { getApiErrorMessage } from "../../../core/api";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAttendanceActions, useMyAttendanceToday } from "../hooks";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

/**
 * Dashboard widget — check in/out for today. `GET /attendance/me/today`'s
 * own `marked` flag (not "is checkOut null") decides which state to
 * show: a day can be marked (e.g. HOLIDAY/WEEK_OFF, no check-in expected)
 * without ever having a check-in at all.
 */
export default function AttendanceTodayWidget() {
  const todayState = useMyAttendanceToday();
  const [actionError, setActionError] = useState("");
  const actions = useAttendanceActions({ onSuccess: () => todayState.refetch() });

  const today = todayState.data;
  const hasCheckedIn = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);

  const runAction = async (mutate) => {
    setActionError("");
    try {
      await mutate();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">Attendance Today</h2>
          {todayState.isLoading ? null : <AttendanceStatusBadge status={today?.status} />}
        </div>
        <div className="flex gap-3">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-50"
            disabled={hasCheckedIn || actions.checkIn.isLoading}
            onClick={() => runAction(actions.checkIn.mutate)}
            type="button"
          >
            <LogIn className="h-4 w-4" />
            Check In
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasCheckedIn || hasCheckedOut || actions.checkOut.isLoading}
            onClick={() => runAction(actions.checkOut.mutate)}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
      </div>

      {actionError ? <p className="mt-3 text-sm font-semibold text-red-700">{actionError}</p> : null}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-In</dt>
          <dd className="mt-1 text-sm text-ink">
            {today?.checkIn ? formatBusinessDateTime(today.checkIn) : "Not yet"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-Out</dt>
          <dd className="mt-1 text-sm text-ink">
            {today?.checkOut ? formatBusinessDateTime(today.checkOut) : "Not yet"}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
