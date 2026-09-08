import { useMemo, useState } from "react";
import ErrorState from "../../../shared/components/ErrorState";
import { formatBusinessDateTime } from "../../../shared/utils";
import Modal from "../../../shared/components/Modal";
import { useMyAttendanceList } from "../hooks";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

/**
 * The calendar for your own attendance.
 *
 * It runs its own month-bounded query rather than reusing the list below
 * it: that list is paginated and filtered by whatever the reader picked,
 * so drawing a month from it would leave holes on page 2 and blank out
 * every day that fails the current status filter.
 */
const monthBounds = (year, month) => ({
  // Both ends inclusive of the whole month in UTC, matching how
  // Attendance.date is stored (business-day marker at UTC midnight).
  from: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
  to: new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString(),
});

export default function MyAttendanceCalendarSection() {
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [selected, setSelected] = useState(null);

  const query = useMemo(
    () => ({ ...monthBounds(period.year, period.month), limit: 100, page: 1, sortOrder: "asc" }),
    [period],
  );
  const { errorMessage, isError, records } = useMyAttendanceList(query);

  return (
    <>
      {isError ? <ErrorState message={errorMessage} title="Unable to load the calendar" /> : null}
      <AttendanceCalendar
        emptyHint="Nothing was marked this month."
        month={period.month}
        onMonthChange={(month, year) => setPeriod({ month, year })}
        onSelectDay={setSelected}
        records={records}
        title="My Attendance Calendar"
        year={period.year}
      />

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="That day">
        {selected ? (
          <div className="space-y-4">
            <AttendanceStatusBadge status={selected.status} />
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-In</dt>
                <dd className="mt-1 text-sm text-ink">
                  {selected.checkIn ? formatBusinessDateTime(selected.checkIn) : "Not marked"}
                </dd>
                {selected.checkInPhoto?.url ? (
                  <img
                    alt="Check-in location"
                    className="mt-2 h-32 w-full rounded-lg object-cover ring-1 ring-forest/15"
                    src={selected.checkInPhoto.url}
                  />
                ) : null}
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-Out</dt>
                <dd className="mt-1 text-sm text-ink">
                  {selected.checkOut ? formatBusinessDateTime(selected.checkOut) : "Not marked"}
                </dd>
                {selected.checkOutPhoto?.url ? (
                  <img
                    alt="Check-out location"
                    className="mt-2 h-32 w-full rounded-lg object-cover ring-1 ring-forest/15"
                    src={selected.checkOutPhoto.url}
                  />
                ) : null}
              </div>
            </dl>
            {selected.workingMinutes ? (
              <p className="text-sm text-muted">
                Worked {Math.floor(selected.workingMinutes / 60)}h {selected.workingMinutes % 60}m.
              </p>
            ) : null}
            {selected.remarks ? <p className="text-sm text-ink">{selected.remarks}</p> : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
