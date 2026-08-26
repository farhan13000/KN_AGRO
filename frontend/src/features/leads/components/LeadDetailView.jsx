import Card from "../../../shared/components/Card";
import { LeadActivityTimeline } from "../../lead-activities";
import { QuotationsForLeadSection } from "../../quotations";
import LeadActionsPanel from "./LeadActionsPanel";
import { LeadPriorityBadge, LeadSourceBadge, LeadStatusBadge } from "./LeadBadges";
import {
  LeadAssignmentSummary,
  LeadContactSummary,
  LeadFollowUpSummary,
  PipelineValueDisplay,
  formatDateTime,
} from "./LeadSummaries";

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value || "Not Set"}</dd>
  </div>
);

function LeadOverviewSection({ lead }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-ink">Overview</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {lead.leadCode || "Lead code pending"} | {lead.companyName || "No company set"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LeadSourceBadge source={lead.source} />
          <LeadPriorityBadge priority={lead.priority} />
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DetailRow label="Lead Code" value={lead.leadCode} />
        <DetailRow label="Name" value={lead.name} />
        <DetailRow label="Company" value={lead.companyName} />
        <DetailRow label="Source" value={lead.source} />
        <DetailRow label="Created" value={formatDateTime(lead.createdAt)} />
        <DetailRow label="Updated" value={formatDateTime(lead.updatedAt)} />
      </dl>
      {lead.message ? (
        <div className="mt-4 rounded-lg border border-forest/10 bg-mint/60 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Message</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">{lead.message}</p>
        </div>
      ) : null}
    </Card>
  );
}

function ProductInterestSection({ lead }) {
  const products = lead.interestedProducts || [];
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Interested Products</h2>
      {products.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <li className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3" key={product._id || product}>
              <p className="text-sm font-black text-ink">{product.name || product}</p>
              {product.productCode || product.slug ? (
                <p className="mt-1 text-xs font-semibold text-muted">
                  {[product.productCode, product.slug].filter(Boolean).join(" | ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">No product interest has been recorded.</p>
      )}
    </Card>
  );
}

function ActivitySection({ recentActivities = [], timelineState }) {
  const activities = timelineState?.data?.activities || recentActivities || [];
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Activity Timeline</h2>
      <div className="mt-4">
        <LeadActivityTimeline
          activities={activities}
          errorMessage={timelineState?.errorMessage}
          isError={timelineState?.isError}
          isLoading={timelineState?.isLoading}
        />
      </div>
    </Card>
  );
}

export default function LeadDetailView({
  lead,
  onMutationSuccess,
  quotationCreatePath = "",
  quotationDetailPathFor,
  recentActivities = [],
  roleLabel = "CRM",
  timelineState,
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">{lead.name || "Lead Detail"}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Current lead state is shown here. Historical changes stay in the activity timeline.
        </p>
      </div>
      <LeadOverviewSection lead={lead} />
      <LeadActionsPanel lead={lead} onSuccess={onMutationSuccess} quotationCreatePath={quotationCreatePath} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <LeadContactSummary lead={lead} />
          <ProductInterestSection lead={lead} />
          <LeadAssignmentSummary lead={lead} />
        </div>
        <div className="space-y-6">
          <PipelineValueDisplay value={lead.expectedValue} />
          <LeadFollowUpSummary lead={lead} />
        </div>
      </div>
      {quotationDetailPathFor ? (
        <QuotationsForLeadSection
          detailPath={(quotation) => quotationDetailPathFor(quotation._id)}
          leadId={lead._id}
        />
      ) : null}
      <ActivitySection recentActivities={recentActivities} timelineState={timelineState} />
    </div>
  );
}
