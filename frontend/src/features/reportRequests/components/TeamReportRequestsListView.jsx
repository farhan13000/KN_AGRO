import { useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { REPORT_STATUS, REPORT_STATUS_LABELS } from "../constants";
import { useTeamReportRequestList } from "../hooks";
import ReportDecisionDialog from "./ReportDecisionDialog";
import ReportRequestCard from "./ReportRequestCard";
import ReportRequestCreateDialog from "./ReportRequestCreateDialog";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// Review/Reject render whenever REPORTS_REVIEW is held (same "backend's
// real 403 is authoritative, never compute 'do I manage this person'
// client-side" posture as every other workflow phase) — a manager
// outside the real chain gets the backend's own 403, not a hidden
// button.
export default function TeamReportRequestsListView({ description, portalLabel, showHeading = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [deciding, setDeciding] = useState(null);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    status: getQueryValue(searchParams, "status") || undefined,
  };
  const { errorMessage, isError, isLoading, pagination, refetch, reportRequests } = useTeamReportRequestList(query);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const actionsFor = (reportRequest) => {
    if (reportRequest.status !== REPORT_STATUS.SUBMITTED) return null;
    return (
      <>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
          onClick={() => setDeciding({ reportRequest, decision: "review" })}
          type="button"
        >
          Approve
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
          onClick={() => setDeciding({ reportRequest, decision: "reject" })}
          type="button"
        >
          Reject
        </button>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {showHeading ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Report Requests</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
          </div>
        ) : null}
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
          onClick={() => setCreating(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Request a Report
        </button>
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
            {Object.values(REPORT_STATUS).map((status) => (
              <option key={status} value={status}>
                {REPORT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? <PageLoader message="Loading report requests..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load report requests" /> : null}
      {!isLoading && !isError && !reportRequests.length ? (
        <EmptyState description="No report requests match the current filters." title="No report requests" />
      ) : null}
      {!isLoading && !isError && reportRequests.length ? (
        <>
          <ul className="space-y-3">
            {reportRequests.map((reportRequest) => (
              <ReportRequestCard
                actions={actionsFor(reportRequest)}
                key={reportRequest._id}
                reportRequest={reportRequest}
                showAssignedTo
              />
            ))}
          </ul>
          <Pagination
            ariaLabel="Report request pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}

      <ReportRequestCreateDialog isOpen={creating} onClose={() => setCreating(false)} onSuccess={refetch} />
      <ReportDecisionDialog
        decision={deciding?.decision}
        isOpen={Boolean(deciding)}
        onClose={() => setDeciding(null)}
        onSuccess={refetch}
        reportRequest={deciding?.reportRequest}
      />
    </div>
  );
}
