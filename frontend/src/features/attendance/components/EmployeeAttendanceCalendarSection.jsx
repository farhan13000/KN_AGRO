import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import ErrorState from "../../../shared/components/ErrorState";
import Modal from "../../../shared/components/Modal";
import { PERMISSIONS } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAllAttendanceList, useTeamAttendanceList } from "../hooks";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceCorrectionDialog from "./AttendanceCorrectionDialog";
import AttendanceDayDetails from "./AttendanceDayDetails";
import { AttendanceReviewDecisionDialog } from "./AttendanceReviewDialogs";

/**
 * One team member's month, for their manager.
 *
 * Which endpoint answers depends on what the viewer holds:
 * `attendance.read_all` sees anyone, `attendance.read_team` only their
 * own downline — and the backend enforces that either way, so this only
 * decides which URL to ask, never who may see what. Exactly one of the
 * two queries is enabled at a time; running both would 403 for every
 * manager who is not also an admin.
 *
 * Review requests the employee sent ("discuss with manager") are listed
 * above the calendar so they are not missed inside a month grid.
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

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint";

export default function EmployeeAttendanceCalendarSection({ employeeId, title = "Attendance" }) {
  const { hasPermission } = useAuth();
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [selected, setSelected] = useState(null);
  const [correcting, setCorrecting] = useState(null);
  const [deciding, setDeciding] = useState(null);

  const canReadAll = hasPermission(PERMISSIONS.ATTENDANCE_READ_ALL);
  const canCorrect = hasPermission(PERMISSIONS.ATTENDANCE_CORRECT);

  const query = useMemo(
    () => ({
      ...monthBounds(period.year, period.month),
      employee: employeeId,
      limit: 100,
      page: 1,
    }),
    [employeeId, period],
  );

  const allState = useAllAttendanceList(query, { enabled: Boolean(employeeId) && canReadAll });
  const teamState = useTeamAttendanceList(query, { enabled: Boolean(employeeId) && !canReadAll });
  const state = canReadAll ? allState : teamState;

  const pendingReviews = state.records.filter((record) => record.review?.status === "PENDING");

  const refresh = () => state.refetch?.();

  return (
    <>
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load attendance" /> : null}

      {canCorrect && pendingReviews.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-black text-amber-900">
            <MessageCircle className="h-4 w-4" />
            Attendance review requests ({pendingReviews.length})
          </p>
          <ul className="mt-3 space-y-2">
            {pendingReviews.map((record) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-amber-200"
                key={record._id}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    {record.checkIn ? formatBusinessDateTime(record.checkIn).split(",")[0] : "Half day"}
                  </p>
                  <p className="truncate text-xs text-muted">“{record.review.message}”</p>
                </div>
                <button className={primaryButton} onClick={() => setDeciding(record)} type="button">
                  Review
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AttendanceCalendar
        emptyHint="Nothing was marked for this person this month."
        month={period.month}
        onMonthChange={(month, year) => setPeriod({ month, year })}
        onSelectDay={setSelected}
        records={state.records}
        title={title}
        year={period.year}
      />

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="That day">
        <AttendanceDayDetails
          actions={
            canCorrect && selected ? (
              <>
                {selected.review?.status === "PENDING" ? (
                  <button
                    className={primaryButton}
                    onClick={() => {
                      setDeciding(selected);
                      setSelected(null);
                    }}
                    type="button"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Review request
                  </button>
                ) : null}
                <button
                  className={selected.review?.status === "PENDING" ? secondaryButton : primaryButton}
                  onClick={() => {
                    setCorrecting(selected);
                    setSelected(null);
                  }}
                  type="button"
                >
                  Approve / correct this day
                </button>
              </>
            ) : null
          }
          record={selected}
        />
      </Modal>

      <AttendanceReviewDecisionDialog
        isOpen={Boolean(deciding)}
        onClose={() => setDeciding(null)}
        onSuccess={() => {
          setDeciding(null);
          refresh();
        }}
        record={deciding}
      />

      <AttendanceCorrectionDialog
        isOpen={Boolean(correcting)}
        onClose={() => setCorrecting(null)}
        onSuccess={() => {
          setCorrecting(null);
          refresh();
        }}
        record={correcting}
      />
    </>
  );
}
