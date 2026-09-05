import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { REPORT_STATUS, REPORT_STATUS_LABELS, REPORT_TYPE, REPORT_TYPE_LABELS } from "../constants";
import { useAllReportRequestList } from "../hooks";
import ReportRequestCard from "./ReportRequestCard";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function AllReportRequestsListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    status: getQueryValue(searchParams, "status") || undefined,
    type: getQueryValue(searchParams, "type") || undefined,
  };
  const { errorMessage, isError, isLoading, pagination, reportRequests } = useAllReportRequestList(query);

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
        <h1 className="mt-2 text-3xl font-black text-ink">Company-Wide Report Requests</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        <p className="mt-2 text-xs font-semibold text-muted">
          REPORTS_MANAGE is currently held only via the SA wildcard — no seeded role grants it
          directly.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
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
          <label>
            <span className="form-label">Type</span>
            <select
              className="form-field"
              onChange={(event) => updateQuery({ type: event.target.value, page: 1 })}
              value={query.type || ""}
            >
              <option value="">All types</option>
              {Object.values(REPORT_TYPE).map((type) => (
                <option key={type} value={type}>
                  {REPORT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
        </div>
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
              <ReportRequestCard key={reportRequest._id} reportRequest={reportRequest} showAssignedTo />
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
    </div>
  );
}
