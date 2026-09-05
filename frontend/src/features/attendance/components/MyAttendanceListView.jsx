import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from "../constants";
import { useMyAttendanceList } from "../hooks";
import AttendanceTable from "./AttendanceTable";
import AttendanceTodayWidget from "./AttendanceTodayWidget";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function MyAttendanceListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    status: getQueryValue(searchParams, "status") || undefined,
    from: getQueryValue(searchParams, "from") || undefined,
    to: getQueryValue(searchParams, "to") || undefined,
    sortOrder: "desc",
  };
  const { errorMessage, isError, isLoading, pagination, records } = useMyAttendanceList(query);

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
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">My Attendance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>

      <AttendanceTodayWidget />

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <label>
            <span className="form-label">Status</span>
            <select
              className="form-field"
              onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}
              value={query.status || ""}
            >
              <option value="">All statuses</option>
              {Object.values(ATTENDANCE_STATUS).map((status) => (
                <option key={status} value={status}>
                  {ATTENDANCE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
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

      {isLoading ? <PageLoader message="Loading attendance..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load attendance" /> : null}
      {!isLoading && !isError && !records.length ? (
        <EmptyState description="No attendance records match the current filters." title="No attendance found" />
      ) : null}
      {!isLoading && !isError && records.length ? (
        <>
          <AttendanceTable records={records} />
          <Pagination
            ariaLabel="Attendance pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
