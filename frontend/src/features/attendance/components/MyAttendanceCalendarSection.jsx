import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import ErrorState from "../../../shared/components/ErrorState";
import Modal from "../../../shared/components/Modal";
import { useMyAttendanceList } from "../hooks";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceDayDetails from "./AttendanceDayDetails";
import { AttendanceReviewRequestDialog } from "./AttendanceReviewDialogs";

/**
 * The calendar for your own attendance.
 *
 * It runs its own month-bounded query rather than reusing the list below
 * it: that list is paginated and filtered by whatever the reader picked,
 * so drawing a month from it would leave holes on page 2 and blank out
 * every day that fails the current status filter.
 */

/**
 * A day wider at each end than the month itself. The stored business-day
 * marker sits at local midnight expressed in UTC, so the 1st of a month
 * in a zone ahead of UTC is stamped on the last UTC day of the previous
 * month — a window of exactly the month would silently drop it. The extra
 * days cost nothing: anything outside the grid simply matches no cell.
 */
const monthBounds = (year, month) => ({
  from: new Date(Date.UTC(year, month - 1, 0)).toISOString(),
  to: new Date(Date.UTC(year, month, 1, 23, 59, 59)).toISOString(),
});

export default function MyAttendanceCalendarSection() {
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [selected, setSelected] = useState(null);
  const [requesting, setRequesting] = useState(null);

  const query = useMemo(
    () => ({ ...monthBounds(period.year, period.month), limit: 100, page: 1, sortOrder: "asc" }),
    [period],
  );
  const { errorMessage, isError, records, refetch } = useMyAttendanceList(query);

  // A half day can be sent to the manager once; after that the day shows
  // the pending request or the decision instead of the button.
  const canAskForReview = selected?.status === "HALF_DAY" && selected?.review?.status !== "PENDING";

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
        <AttendanceDayDetails
          actions={
            canAskForReview ? (
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                onClick={() => {
                  setRequesting(selected);
                  setSelected(null);
                }}
                type="button"
              >
                <MessageCircle className="h-4 w-4" />
                Discuss with manager
              </button>
            ) : null
          }
          record={selected}
        />
      </Modal>

      <AttendanceReviewRequestDialog
        isOpen={Boolean(requesting)}
        onClose={() => setRequesting(null)}
        onSuccess={async () => {
          setRequesting(null);
          await refetch?.();
        }}
        record={requesting}
      />
    </>
  );
}
