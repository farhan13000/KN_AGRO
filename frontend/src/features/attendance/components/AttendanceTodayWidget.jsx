import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import Card from "../../../shared/components/Card";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAttendanceActions, useMyAttendanceToday } from "../hooks";
import AttendanceMarkDialog from "./AttendanceMarkDialog";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

/**
 * Dashboard widget — check in/out for today. `GET /attendance/me/today`'s
 * own `marked` flag (not "is checkOut null") decides which state to
 * show: a day can be marked (e.g. HOLIDAY/WEEK_OFF, no check-in expected)
 * without ever having a check-in at all.
 */
export default function AttendanceTodayWidget() {
  const todayState = useMyAttendanceToday();
  // null when closed, "in" or "out" while the photo is being taken.
  const [marking, setMarking] = useState(null);
  const actions = useAttendanceActions({ onSuccess: () => todayState.refetch() });

  const today = todayState.data;
  const hasCheckedIn = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);

  // The dialog owns the photo and surfaces its own errors, so a failure
  // here is rethrown for it rather than swallowed into this card.
  const confirmMark = async (photo) => {
    const mutate = marking === "out" ? actions.checkOut.mutate : actions.checkIn.mutate;
    await mutate(photo);
    setMarking(null);
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
            onClick={() => setMarking("in")}
            type="button"
          >
            <LogIn className="h-4 w-4" />
            Check In
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasCheckedIn || hasCheckedOut || actions.checkOut.isLoading}
            onClick={() => setMarking("out")}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-In</dt>
          <dd className="mt-1 text-sm text-ink">
            {today?.checkIn ? formatBusinessDateTime(today.checkIn) : "Not yet"}
          </dd>
          {today?.checkInPhoto?.url ? (
            <a
              className="mt-2 inline-block"
              href={today.checkInPhoto.url}
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Check-in location"
                className="h-20 w-20 rounded-lg object-cover ring-1 ring-forest/15"
                src={today.checkInPhoto.url}
              />
            </a>
          ) : null}
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-Out</dt>
          <dd className="mt-1 text-sm text-ink">
            {today?.checkOut ? formatBusinessDateTime(today.checkOut) : "Not yet"}
          </dd>
          {today?.checkOutPhoto?.url ? (
            <a
              className="mt-2 inline-block"
              href={today.checkOutPhoto.url}
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Check-out location"
                className="h-20 w-20 rounded-lg object-cover ring-1 ring-forest/15"
                src={today.checkOutPhoto.url}
              />
            </a>
          ) : null}
        </div>
      </dl>

      <AttendanceMarkDialog
        isOpen={Boolean(marking)}
        mode={marking || "in"}
        onClose={() => setMarking(null)}
        onConfirm={confirmMark}
      />
    </Card>
  );
}
