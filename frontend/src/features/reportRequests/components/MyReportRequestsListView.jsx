import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { getApiErrorMessage } from "../../../core/api";
import { REPORT_STATUS, REPORT_STATUS_LABELS } from "../constants";
import { useMyReportRequestList, useReportRequestActions } from "../hooks";
import ReportRequestCard from "./ReportRequestCard";
import ReportSubmitDialog from "./ReportSubmitDialog";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function MyReportRequestsListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(null);
  const [actionError, setActionError] = useState("");
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: 20,
    status: getQueryValue(searchParams, "status") || undefined,
  };
  const { errorMessage, isError, isLoading, pagination, refetch, reportRequests } = useMyReportRequestList(query);
  const { startWork } = useReportRequestActions({ onSuccess: refetch });

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const handleStart = async (reportRequest) => {
    setActionError("");
    try {
      await startWork.mutate(reportRequest._id);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const actionsFor = (reportRequest) => {
    if (reportRequest.status === REPORT_STATUS.PENDING) {
      return (
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
          onClick={() => handleStart(reportRequest)}
          type="button"
        >
          Start
        </button>
      );
    }
    if (reportRequest.status === REPORT_STATUS.IN_PROGRESS) {
      return (
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
          onClick={() => setSubmitting({ reportRequest, isResubmit: false })}
          type="button"
        >
          Submit
        </button>
      );
    }
    if (reportRequest.status === REPORT_STATUS.REJECTED) {
      return (
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
          onClick={() => setSubmitting({ reportRequest, isResubmit: true })}
          type="button"
        >
          Resubmit
        </button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">My Report Requests</h1>
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
            {Object.values(REPORT_STATUS).map((status) => (
              <option key={status} value={status}>
                {REPORT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {actionError}
        </p>
      ) : null}

      {isLoading ? <PageLoader message="Loading report requests..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load report requests" /> : null}
      {!isLoading && !isError && !reportRequests.length ? (
        <EmptyState description="No reports have been requested from you yet." title="No report requests" />
      ) : null}
      {!isLoading && !isError && reportRequests.length ? (
        <>
          <ul className="space-y-3">
            {reportRequests.map((reportRequest) => (
              <ReportRequestCard actions={actionsFor(reportRequest)} key={reportRequest._id} reportRequest={reportRequest} />
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

      <ReportSubmitDialog
        isOpen={Boolean(submitting)}
        isResubmit={submitting?.isResubmit}
        onClose={() => setSubmitting(null)}
        onSuccess={refetch}
        reportRequest={submitting?.reportRequest}
      />
    </div>
  );
}
