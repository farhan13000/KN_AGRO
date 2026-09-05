import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useAllAttendanceList } from "../hooks";
import AttendanceCorrectionDialog from "./AttendanceCorrectionDialog";
import AttendanceTable from "./AttendanceTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function AllAttendanceListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [correctingRecord, setCorrectingRecord] = useState(null);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    from: getQueryValue(searchParams, "from") || undefined,
    to: getQueryValue(searchParams, "to") || undefined,
  };
  const { errorMessage, isError, isLoading, pagination, records, refetch } = useAllAttendanceList(query);

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
        <h1 className="mt-2 text-3xl font-black text-ink">Company-Wide Attendance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        <p className="mt-2 text-xs font-semibold text-muted">
          ATTENDANCE_READ_ALL and ATTENDANCE_CORRECT are currently held only via the SA wildcard —
          no seeded role grants either directly.
        </p>
      </div>

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

      {isLoading ? <PageLoader message="Loading attendance..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load attendance" /> : null}
      {!isLoading && !isError && !records.length ? (
        <EmptyState description="No attendance records match the current filters." title="No attendance found" />
      ) : null}
      {!isLoading && !isError && records.length ? (
        <>
          <AttendanceTable onCorrect={setCorrectingRecord} records={records} showEmployee />
          <Pagination
            ariaLabel="Attendance pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}

      <AttendanceCorrectionDialog
        isOpen={Boolean(correctingRecord)}
        onClose={() => setCorrectingRecord(null)}
        onSuccess={refetch}
        record={correctingRecord}
      />
    </div>
  );
}
