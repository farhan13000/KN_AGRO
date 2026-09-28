import { useMemo, useState } from "react";
import ErrorState from "../../../shared/components/ErrorState";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import Modal from "../../../shared/components/Modal";
import { useEmployeeMonthlyAttendance } from "../hooks";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceDayDetails from "./AttendanceDayDetails";

/**
 * One person's month, opened from a name.
 *
 * The calendar itself is the one already used everywhere else — this
 * supplies it with a month and adds the count strip above it, because a
 * grid answers "which days" and only the numbers answer "how many".
 *
 * WHY "NO RECORD" IS ITS OWN NUMBER and not folded into absences: this
 * system has no holiday or week-off calendar, so a blank day means only
 * that nobody wrote anything down. Counting those as absences would put
 * a number on this screen that a manager might act on — or pay on — and
 * that nothing in the data supports.
 */
const TILES = [
  { key: "presentDays", label: "Present", tone: "bg-forest/10 text-forest" },
  { key: "halfDays", label: "Half days", tone: "bg-amber-100 text-amber-800" },
  { key: "leaveDays", label: "Leave", tone: "bg-sky-100 text-sky-800" },
  { key: "absentDays", label: "Marked absent", tone: "bg-red-100 text-red-800" },
];

const hoursOf = (minutes) => {
  if (!minutes) return "0h";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export default function EmployeeMonthlyAttendanceDialog({ employee, isOpen, onClose }) {
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [selectedDay, setSelectedDay] = useState(null);

  const employeeId = employee?._id;
  const { errorMessage, isError, isLoading, report } = useEmployeeMonthlyAttendance(
    employeeId,
    period.month,
    period.year,
    { enabled: isOpen && Boolean(employeeId) },
  );

  // The calendar takes plain attendance records; the month's empty days
  // carry no record and simply match no cell, which is exactly how the
  // calendar already renders "nothing marked".
  const records = useMemo(
    () => (report?.days || []).map((day) => day.attendance).filter(Boolean),
    [report],
  );

  const summary = report?.summary;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={employee?.user?.name || "Monthly attendance"}>
        <div className="space-y-4" data-monthly-report>
          <p className="text-sm font-semibold text-muted">
            {[employee?.designation, employee?.employeeCode].filter(Boolean).join(" · ")}
          </p>

          {isError ? <ErrorState message={errorMessage} title="Unable to load this month" /> : null}

          {isLoading && !report ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : null}

          {summary ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TILES.map((tile) => (
                <div className={`rounded-xl p-3 ${tile.tone}`} key={tile.key}>
                  <p className="text-2xl font-black" data-tile={tile.key}>
                    {summary[tile.key] ?? 0}
                  </p>
                  <p className="text-xs font-bold">{tile.label}</p>
                </div>
              ))}
              <div className="rounded-xl bg-forest/5 p-3">
                <p className="text-2xl font-black text-ink" data-tile="daysWithNoRecord">
                  {report.daysWithNoRecord}
                </p>
                <p className="text-xs font-bold text-muted">No record</p>
              </div>
              <div className="rounded-xl bg-forest/5 p-3">
                <p className="text-2xl font-black text-ink">{hoursOf(summary.totalWorkingMinutes)}</p>
                <p className="text-xs font-bold text-muted">Hours worked</p>
              </div>
            </div>
          ) : null}

          <AttendanceCalendar
            emptyHint="Nothing was marked for this person this month."
            month={period.month}
            onMonthChange={(month, year) => setPeriod({ month, year })}
            onSelectDay={setSelectedDay}
            records={records}
            title="Month view"
            year={period.year}
          />

          <p className="text-xs leading-5 text-muted">
            A blank day means nothing was recorded for it — not that the person was absent. Days marked absent are
            counted separately above.
          </p>
        </div>
      </Modal>

      <Modal isOpen={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} title="That day">
        <AttendanceDayDetails record={selectedDay} />
      </Modal>
    </>
  );
}
