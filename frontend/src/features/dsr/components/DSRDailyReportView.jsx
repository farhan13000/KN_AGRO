import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../../../shared/components/Avatar";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { env } from "../../../core/config/env";
import { getBusinessDateKey } from "../../../shared/utils";
import { DSR_REPORT_REASON, DSR_REPORT_REASON_LABELS, DSR_REPORT_REASON_STYLE } from "../constants";
import { useDSRDailyReport } from "../hooks";
import DSRStatusBadge from "./DSRStatusBadge";

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

function PersonRow({ children, row }) {
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
    </li>
  );
}

/**
 * ONE DAY, TWO LISTS: who filed today's DSR, and who has not.
 *
 * Built to read exactly like the attendance daily report beside it,
 * because it answers the evening half of the same question — the day
 * started there and finishes here, and a manager should not have to
 * learn two screens to run one routine.
 *
 * The second list is the reason it exists, and a list of DSR records
 * could never produce it: not filing leaves nothing behind. The backend
 * lays the day's reports over the roster of people who owe one (see
 * DSRService.getDailyReport).
 *
 * WHAT IS SHOWN BESIDE EACH MISSING REPORT IS THE DAY'S CHECK-IN, and
 * that pairing is the whole value of the screen. "No report and never
 * checked in" is a different conversation from "worked all day and filed
 * nothing" — the first is a question about the person, the second is a
 * two-minute job they forgot. Without the check-in on the row a manager
 * has to open a second screen to tell them apart, which in practice
 * means they do not.
 *
 * Somebody on approved leave appears in the second list too, but marked
 * as such and in a different colour: they owe nothing, and burying that
 * fact would make the amber count meaningless.
 */
export default function DSRDailyReportView({ description, detailPath }) {
  const [dateKey, setDateKey] = useState(() => getBusinessDateKey(new Date()));

  const isToday = dateKey === getBusinessDateKey(new Date());
  const { errorMessage, isError, isLoading, notSubmitted, submitted, summary } = useDSRDailyReport(dateKey);

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
            // Tomorrow has no reports to show. Same reason the attendance
            // report stops at today: "0 of 21 submitted" for a date that
            // has not happened reads as a disaster.
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

      {isError ? <ErrorState message={errorMessage} title="Unable to load the daily DSR report" /> : null}
      {isLoading && !summary ? <PageLoader message="Loading the day's reports..." /> : null}

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryTile label="Owe a report" value={summary.total} />
            <SummaryTile label="Submitted" tone="bg-forest/10 text-forest" value={summary.submitted} />
            <SummaryTile label="Still pending" tone="bg-amber-100 text-amber-800" value={summary.stillOwed} />
            <SummaryTile label="Never checked in" tone="bg-red-100 text-red-800" value={summary.notCheckedIn} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 border-b border-forest/10 px-4 py-3">
                <h2 className="text-sm font-black text-ink">Submitted</h2>
                <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-black text-forest">
                  {submitted.length}
                </span>
              </div>
              {submitted.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-semibold text-muted">
                  No reports are in {isToday ? "yet" : "for this day"}.
                </p>
              ) : (
                <ul data-dsr-submitted>
                  {submitted.map((row) => (
                    <PersonRow key={row.employee._id} row={row}>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-black text-ink">{timeOf(row.dsr.createdAt)}</p>
                          <DSRStatusBadge status={row.dsr.status} />
                        </div>
                        {detailPath ? (
                          <Link
                            aria-label={`Open ${row.employee?.user?.name || "this"} report`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                            to={detailPath(row.dsr._id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    </PersonRow>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 border-b border-forest/10 px-4 py-3">
                <h2 className="text-sm font-black text-ink">Not submitted</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                  {notSubmitted.length}
                </span>
              </div>
              {notSubmitted.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-semibold text-muted">
                  Everyone has filed their report.
                </p>
              ) : (
                <ul data-dsr-not-submitted>
                  {notSubmitted.map((row) => (
                    <PersonRow key={row.employee._id} row={row}>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${
                            DSR_REPORT_REASON_STYLE[row.reason] || ""
                          }`}
                          data-reason={row.reason}
                        >
                          {DSR_REPORT_REASON_LABELS[row.reason] || row.reason}
                        </span>
                        {row.reason === DSR_REPORT_REASON.NOT_SUBMITTED ? (
                          <p className="mt-1 text-xs font-semibold text-muted">
                            {row.checkIn ? `Checked in ${timeOf(row.checkIn)}` : "Never checked in"}
                          </p>
                        ) : null}
                      </div>
                    </PersonRow>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <p className="text-xs leading-5 text-muted">
            Everyone who files a daily report is on this list. Anyone on approved leave is shown but owes nothing, so
            the amber count is only the reports actually still due. Reminders go out automatically in the evening.
          </p>
        </>
      ) : null}
    </div>
  );
}
