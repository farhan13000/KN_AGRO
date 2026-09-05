import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { LEAVE_STATUS, LEAVE_STATUS_LABELS } from "../constants";
import { useAllLeaveList } from "../hooks";
import LeaveCard from "./LeaveCard";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function AllLeavesListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    status: getQueryValue(searchParams, "status") || undefined,
  };
  const { errorMessage, isError, isLoading, leaves, pagination } = useAllLeaveList(query);

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
        <h1 className="mt-2 text-3xl font-black text-ink">Company-Wide Leaves</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        <p className="mt-2 text-xs font-semibold text-muted">
          LEAVES_READ_ALL is currently held only via the SA wildcard — no seeded role grants it
          directly.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <label className="block max-w-xs">
          <span className="form-label">Status</span>
          <select
            className="form-field"
            onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}
            value={query.status || ""}
          >
            <option value="">All statuses</option>
            {Object.values(LEAVE_STATUS).map((status) => (
              <option key={status} value={status}>
                {LEAVE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? <PageLoader message="Loading leaves..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load leaves" /> : null}
      {!isLoading && !isError && !leaves.length ? (
        <EmptyState description="No leave requests match the current filters." title="No leave requests" />
      ) : null}
      {!isLoading && !isError && leaves.length ? (
        <>
          <ul className="space-y-3">
            {leaves.map((leave) => (
              <LeaveCard key={leave._id} leave={leave} showEmployee />
            ))}
          </ul>
          <Pagination
            ariaLabel="Leave pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
