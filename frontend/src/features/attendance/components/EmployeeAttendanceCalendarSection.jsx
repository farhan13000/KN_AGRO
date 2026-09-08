import { useMemo, useState } from "react";
import ErrorState from "../../../shared/components/ErrorState";
import Modal from "../../../shared/components/Modal";
import { PERMISSIONS } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useAllAttendanceList, useTeamAttendanceList } from "../hooks";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceCorrectionDialog from "./AttendanceCorrectionDialog";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

/**
 * One team member's month, for their manager.
 *
 * Which endpoint answers depends on what the viewer holds:
 * `attendance.read_all` sees anyone, `attendance.read_team` only their
 * own downline — and the backend enforces that either way, so this only
 * decides which URL to ask, never who may see what. Exactly one of the
 * two queries is enabled at a time; running both would 403 for every
 * manager who is not also an admin.
 */
const monthBounds = (year, month) => ({
  from: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
  to: new Date(Date.UTC(year, month, 0, 23, 59, 59)).toISOString(),
});

export default function EmployeeAttendanceCalendarSection({ employeeId, title = "Attendance" }) {
  const { hasPermission } = useAuth();
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [selected, setSelected] = useState(null);
  const [correcting, setCorrecting] = useState(null);

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

  return (
    <>
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load attendance" /> : null}
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
                  <a href={selected.checkInPhoto.url} rel="noreferrer" target="_blank">
                    <img
                      alt="Check-in location"
                      className="mt-2 h-32 w-full rounded-lg object-cover ring-1 ring-forest/15"
                      src={selected.checkInPhoto.url}
                    />
                  </a>
                ) : null}
              </div>
              <div>
                <dt className="text-xs font-black uppercase tracking-wide text-muted">Check-Out</dt>
                <dd className="mt-1 text-sm text-ink">
                  {selected.checkOut ? formatBusinessDateTime(selected.checkOut) : "Not marked"}
                </dd>
                {selected.checkOutPhoto?.url ? (
                  <a href={selected.checkOutPhoto.url} rel="noreferrer" target="_blank">
                    <img
                      alt="Check-out location"
                      className="mt-2 h-32 w-full rounded-lg object-cover ring-1 ring-forest/15"
                      src={selected.checkOutPhoto.url}
                    />
                  </a>
                ) : null}
              </div>
            </dl>
            {selected.remarks ? <p className="text-sm text-ink">{selected.remarks}</p> : null}
            {canCorrect ? (
              <div className="flex justify-end">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                  onClick={() => {
                    setCorrecting(selected);
                    setSelected(null);
                  }}
                  type="button"
                >
                  Approve / correct this day
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <AttendanceCorrectionDialog
        isOpen={Boolean(correcting)}
        onClose={() => setCorrecting(null)}
        onSuccess={() => {
          setCorrecting(null);
          state.refetch?.();
        }}
        record={correcting}
      />
    </>
  );
}
