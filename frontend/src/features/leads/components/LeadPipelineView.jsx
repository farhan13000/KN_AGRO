import { Link } from "react-router-dom";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "../constants";
import { useLeadList, useLeadSummary } from "../hooks";
import { formatBusinessDateTime } from "../../../shared/utils";
import { formatPipelineValue } from "../utils";
import { LeadPriorityBadge, LeadStatusBadge } from "./LeadBadges";
import LeadSummaryCards from "./LeadSummaryCards";

function PipelineColumn({ detailPath, status }) {
  const leadState = useLeadList({
    page: 1,
    limit: 8,
    status,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const leads = leadState.data?.leads || [];
  const pagination = leadState.data?.pagination || {};

  return (
    <Card className="flex min-h-[320px] flex-col p-4">
      <div className="flex items-center justify-between gap-3">
        <LeadStatusBadge status={status} />
        <span className="text-xs font-black text-muted">{pagination.total ?? leads.length}</span>
      </div>
      {leadState.isLoading ? <PageLoader message="Loading..." /> : null}
      {leadState.isError ? <ErrorState message={leadState.errorMessage} title="Unable to load stage" /> : null}
      {!leadState.isLoading && !leadState.isError ? (
        <div className="mt-4 space-y-3">
          {leads.length ? (
            leads.map((lead) => (
              <Link
                className="block rounded-lg border border-forest/10 bg-white p-3 transition hover:bg-mint"
                key={lead._id}
                to={detailPath(lead)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ink">{lead.name || "Unnamed Lead"}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-muted">{lead.companyName || lead.leadCode}</p>
                  </div>
                  <LeadPriorityBadge priority={lead.priority} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted">
                  <span>{formatPipelineValue(lead.expectedValue)}</span>
                  <span>{formatBusinessDateTime(lead.nextFollowUpAt)}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-forest/15 bg-mint/40 px-3 py-6 text-center text-sm font-semibold text-muted">
              No {LEAD_STATUS_LABELS[status]} leads.
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export default function LeadPipelineView({
  detailPath,
  roleLabel = "CRM",
  showHeading = true,
  title = "CRM Pipeline",
}) {
  const summaryState = useLeadSummary();

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Pipeline stages use status-filtered backend requests. Status changes stay explicit actions on lead detail.
          </p>
        </div>
      ) : null}

      {!summaryState.isLoading && !summaryState.isError ? (
        <LeadSummaryCards summary={summaryState.data} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {LEAD_STATUSES.map((status) => (
          <PipelineColumn detailPath={detailPath} key={status} status={status} />
        ))}
      </div>
    </div>
  );
}
