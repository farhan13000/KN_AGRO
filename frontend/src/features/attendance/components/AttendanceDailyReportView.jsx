import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Avatar from "../../../shared/components/Avatar";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { env } from "../../../core/config/env";
import { getBusinessDateKey } from "../../../shared/utils";
import { DAILY_REPORT_REASON_LABELS, DAILY_REPORT_REASON_STYLE } from "../constants";
import { useAttendanceDailyReport } from "../hooks";
import EmployeeMonthlyAttendanceDialog from "./EmployeeMonthlyAttendanceDialog";

/** "4:05 pm" in business time — the stored instant is UTC. */
const timeOf = (value) => {
  if (!value) return "";
  return new Date(value)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: env.businessTimezone })
    .toLowerCase();
};

const dayLabel = (key) => {
  const todayKey = getBusinessDateKey(new Date());
  if (key === todayKey) return "Today";
  const yesterdayKey = getBusinessDateKey(new Date(Date.now() - 86400000));
  if (key === yesterdayKey) return "Yesterday";
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const shiftDay = (key, days) => {
  const shifted = new Date(`${key}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
};

function SummaryTile({ label, tone = "bg-forest/5 text-ink", value }) {
  return (
    <div className={`rounded-xl p-3 ${tone}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-bold">{label}</p>
    </div>
  );
}

function PersonRow({ children, onOpenMonth, row }) {
  const employee = row.employee;

  return (
    <li className="flex items-center gap-3 border-b border-forest/5 px-3 py-3 last:border-b-0">
      <Avatar name={employee?.user?.name || ""} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-ink">{employee?.user?.name || "Unnamed"}</p>
        <p className="truncate text-xs font-semibold text-muted">
          {[employee?.designation, employee?.employeeCode].filter(Boolean).join(" · ")}
        </p>
      </div>
      {children}
      <button
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
        data-open-month={employee?._id}
        onClick={() => onOpenMonth(employee)}
        title={`See ${employee?.user?.name || "this person"}'s month`}
        type="button"
      >
        <CalendarDays className="h-4 w-4" />
        <span className="hidden sm:inline">Month</span>
      </button>
    </li>
  );
}

/**
 * ONE DAY, TWO LISTS: who checked in, and who has not.
 *
 * The second list is the reason this screen exists, and it is the one a
 * table of attendance records could never show — not checking in leaves
 * no record to list. The backend builds it by laying the day's records
 * over the roster of active staff (see AttendanceService.getDailyReport).
 *
 * Nobody in the second list is called absent. Each carries the reason
 * actually known — "not marked yet" where there is no record at all, and
 * the recorded status where there is one. At nine in the morning the
 * whole company is on that list, and a screen that read "12 absent"
 * would be wrong about every one of them.
 */
export default function AttendanceDailyReportView({ description }) {
  const [dateKey, setDateKey] = useState(() => getBusinessDateKey(new Date()));
  const [monthEmployee, setMonthEmployee] = useState(null);

  const isToday = dateKey === getBusinessDateKey(new Date());
  const { checkedIn, errorMessage, isError, isLoading, notCheckedIn, summary } = useAttendanceDailyReport(dateKey);

  return (
    <div className="space-y-5">
      {description ? <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous day"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => setDateKey((current) => shiftDay(current, -1))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-36 text-center text-sm font-black text-ink" data-report-day>
            {dayLabel(dateKey)}
          </span>
          <button
            aria-label="Next day"
            // Tomorrow has no attendance to show, so the day cannot be
            // stepped past today — an empty "0 of 21 checked in" for a
            // future date reads as a disaster rather than as a date that
            // has not happened.
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:opacity-40"
            disabled={isToday}
            onClick={() => setDateKey((current) => shiftDay(current, 1))}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-muted">Pick a date</span>
          <input
            className="form-field"
            max={getBusinessDateKey(new Date())}
            onChange={(event) => event.target.value && setDateKey(event.target.value)}
            type="date"
            value={dateKey}
          />
        </label>
      </Card>

      {isError ? <ErrorState message={errorMessage} title="Unable to load the daily report" /> : null}
      {isLoading && !summary ? <PageLoader message="Loading the day's attendance..." /> : null}

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryTile label="On the roster" value={summary.total} />
            <SummaryTile label="Checked in" tone="bg-forest/10 text-forest" value={summary.checkedIn} />
            <SummaryTile label="Not checked in" tone="bg-amber-100 text-amber-800" value={summary.notCheckedIn} />
            <SummaryTile label="Late" tone="bg-red-100 text-red-800" value={summary.lateCheckIns} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 border-b border-forest/10 px-4 py-3">
                <h2 className="text-sm font-black text-ink">Checked in</h2>
                <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-black text-forest">
                  {checkedIn.length}
                </span>
              </div>
              {checkedIn.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-semibold text-muted">
                  Nobody has checked in {isToday ? "yet" : "on this day"}.
                </p>
              ) : (
                <ul data-checked-in>
                  {checkedIn.map((row) => (
                    <PersonRow key={row.employee._id} onOpenMonth={setMonthEmployee} row={row}>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-ink">
                          {timeOf(row.attendance.checkIn)}
                          {row.attendance.lateCheckIn ? (
                            <span className="ml-1.5 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-black text-red-700">
                              Late
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs font-semibold text-muted">
                          {row.attendance.checkOut ? `Out ${timeOf(row.attendance.checkOut)}` : "Still working"}
                        </p>
                      </div>
                    </PersonRow>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 border-b border-forest/10 px-4 py-3">
                <h2 className="text-sm font-black text-ink">Not checked in</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                  {notCheckedIn.length}
                </span>
              </div>
              {notCheckedIn.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-semibold text-muted">
                  Everyone on the roster has checked in.
                </p>
              ) : (
                <ul data-not-checked-in>
                  {notCheckedIn.map((row) => (
                    <PersonRow key={row.employee._id} onOpenMonth={setMonthEmployee} row={row}>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${
                          DAILY_REPORT_REASON_STYLE[row.reason] || ""
                        }`}
                        data-reason={row.reason}
                      >
                        {DAILY_REPORT_REASON_LABELS[row.reason] || row.reason}
                      </span>
                    </PersonRow>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <p className="text-xs leading-5 text-muted">
            &ldquo;Not marked yet&rdquo; means no check-in has been recorded — it is not the same as being absent,
            and this screen never decides that on anyone&apos;s behalf.
          </p>
        </>
      ) : null}

      <EmployeeMonthlyAttendanceDialog
        employee={monthEmployee}
        isOpen={Boolean(monthEmployee)}
        onClose={() => setMonthEmployee(null)}
      />
    </div>
  );
}
