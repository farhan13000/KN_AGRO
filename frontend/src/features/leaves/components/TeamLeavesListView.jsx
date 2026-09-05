import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { LEAVE_STATUS, LEAVE_STATUS_LABELS } from "../constants";
import { useTeamLeaveList } from "../hooks";
import LeaveCard from "./LeaveCard";
import LeaveDecisionDialog from "./LeaveDecisionDialog";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// Approve/Reject render whenever LEAVES_APPROVE is held (same "backend's
// real 403 is authoritative, never compute 'do I manage this person'
// client-side" posture as every other workflow phase) — a manager
// outside the real chain gets the backend's own 403, not a hidden
// button.
export default function TeamLeavesListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deciding, setDeciding] = useState(null);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    status: getQueryValue(searchParams, "status") || undefined,
  };
  const { errorMessage, isError, isLoading, leaves, pagination, refetch } = useTeamLeaveList(query);

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
        <h1 className="mt-2 text-3xl font-black text-ink">Team Leaves</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
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

      {isLoading ? <PageLoader message="Loading team leaves..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load team leaves" /> : null}
      {!isLoading && !isError && !leaves.length ? (
        <EmptyState description="No leave requests match the current filters." title="No leave requests" />
      ) : null}
      {!isLoading && !isError && leaves.length ? (
        <>
          <ul className="space-y-3">
            {leaves.map((leave) => (
              <LeaveCard
                actions={
                  leave.status === LEAVE_STATUS.PENDING ? (
                    <>
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                        onClick={() => setDeciding({ leave, decision: "approve" })}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                        onClick={() => setDeciding({ leave, decision: "reject" })}
                        type="button"
                      >
                        Reject
                      </button>
                    </>
                  ) : null
                }
                key={leave._id}
                leave={leave}
                showEmployee
              />
            ))}
          </ul>
          <Pagination
            ariaLabel="Team leave pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}

      <LeaveDecisionDialog
        decision={deciding?.decision}
        isOpen={Boolean(deciding)}
        leave={deciding?.leave}
        onClose={() => setDeciding(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
