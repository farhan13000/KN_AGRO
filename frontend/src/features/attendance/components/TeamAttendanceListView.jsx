import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useTeamAttendanceList, useTeamAttendanceSummary } from "../hooks";
import AttendanceTable from "./AttendanceTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;
const now = new Date();

export default function TeamAttendanceListView({ description, portalLabel, showHeading = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const month = Number(getQueryValue(searchParams, "month", String(now.getMonth() + 1)));
  const year = Number(getQueryValue(searchParams, "year", String(now.getFullYear())));

  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    from: getQueryValue(searchParams, "from") || undefined,
    to: getQueryValue(searchParams, "to") || undefined,
  };
  const { errorMessage, isError, isLoading, pagination, records } = useTeamAttendanceList(query);
  const summaryState = useTeamAttendanceSummary(month, year);
  const summaryRows = summaryState.data || [];

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Team Attendance</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
      ) : null}

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-black text-ink">Monthly Summary</h2>
          <div className="flex gap-3">
            <label>
              <span className="form-label">Month</span>
              <select
                className="form-field"
                onChange={(event) => updateQuery({ month: event.target.value })}
                value={month}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="form-label">Year</span>
              <input
                className="form-field"
                min="2000"
                max="2100"
                onChange={(event) => updateQuery({ year: event.target.value })}
                type="number"
                value={year}
              />
            </label>
          </div>
        </div>

        {summaryState.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading summary...</p> : null}
        {!summaryState.isLoading && summaryRows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] divide-y divide-forest/10 text-left text-sm">
              <thead className="text-xs font-black uppercase text-forest">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Present</th>
                  <th className="px-3 py-2">Half Days</th>
                  <th className="px-3 py-2">Leave</th>
                  <th className="px-3 py-2">Recorded Absences</th>
                  <th className="px-3 py-2">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {summaryRows.map((row) => (
                  <tr key={row.employee?._id}>
                    <td className="px-3 py-2 font-semibold text-ink">
                      {row.employee?.user?.name || row.employee?.employeeCode}
                    </td>
                    <td className="px-3 py-2 text-muted">{row.presentDays}</td>
                    <td className="px-3 py-2 text-muted">{row.halfDays}</td>
                    <td className="px-3 py-2 text-muted">{row.leaveDays}</td>
                    <td className="px-3 py-2 text-muted">{row.recordedAbsences}</td>
                    <td className="px-3 py-2 text-muted">
                      {row.attendancePercentage === null ? "—" : `${row.attendancePercentage}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="form-label">From</span>
            <input
              className="form-field"
              onChange={(event) => updateQuery({ from: event.target.value, page: 1 })}
              type="date"
              value={getQueryValue(searchParams, "from")}
            />
          </label>
          <label>
            <span className="form-label">To</span>
            <input
              className="form-field"
              onChange={(event) => updateQuery({ to: event.target.value, page: 1 })}
              type="date"
              value={getQueryValue(searchParams, "to")}
            />
          </label>
        </div>
      </section>

      {isLoading ? <PageLoader message="Loading team attendance..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load team attendance" /> : null}
      {!isLoading && !isError && !records.length ? (
        <EmptyState description="No attendance records match the current filters." title="No attendance found" />
      ) : null}
      {!isLoading && !isError && records.length ? (
        <>
          <AttendanceTable records={records} showEmployee />
          <Pagination
            ariaLabel="Team attendance pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
