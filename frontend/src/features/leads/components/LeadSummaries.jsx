import { CalendarClock, Mail, MapPin, Phone, UserRound } from "lucide-react";
import Card from "../../../shared/components/Card";
import { formatBusinessDateTime, getFollowUpPresentationState } from "../../../shared/utils";
import { formatEmployeeSummary, formatGeoSummary, formatPipelineValue } from "../utils";

const toneClasses = {
  danger: "text-red-700",
  muted: "text-muted",
  success: "text-emerald-700",
  warning: "text-amber-700",
};

const SummaryLine = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-agriculture" />
    <div className="min-w-0">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value || "Not Set"}</p>
    </div>
  </div>
);

export const LeadContactSummary = ({ lead }) => (
  <Card className="p-5">
    <h2 className="text-lg font-black text-ink">Contact</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <SummaryLine icon={UserRound} label="Name" value={lead?.name} />
      <SummaryLine icon={Phone} label="Phone" value={lead?.phone} />
      <SummaryLine icon={Mail} label="Email" value={lead?.email} />
      <SummaryLine icon={MapPin} label="Location" value={lead?.location} />
    </div>
  </Card>
);

export const LeadAssignmentSummary = ({ lead }) => (
  <Card className="p-5">
    <h2 className="text-lg font-black text-ink">Assignment</h2>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3">
        <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">Manager</dt>
        <dd className="mt-1 text-sm font-semibold text-ink">{formatEmployeeSummary(lead?.assignedManager)}</dd>
      </div>
      <div className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3">
        <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">Employee</dt>
        <dd className="mt-1 text-sm font-semibold text-ink">{formatEmployeeSummary(lead?.assignedEmployee)}</dd>
      </div>
      {/* Captured once at creation, never recomputed on a later transfer
          of the owning employee — see backend lead.service.js's own
          Phase 10 comment on this. */}
      <div className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3">
        <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">Region</dt>
        <dd className="mt-1 text-sm font-semibold text-ink">{formatGeoSummary(lead?.region)}</dd>
      </div>
      <div className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3">
        <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">District</dt>
        <dd className="mt-1 text-sm font-semibold text-ink">{formatGeoSummary(lead?.district)}</dd>
      </div>
    </dl>
  </Card>
);

export const LeadFollowUpSummary = ({ lead }) => {
  const state = getFollowUpPresentationState(lead?.nextFollowUpAt);
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Follow-Up</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Next Follow-Up</p>
          <p className="mt-1 text-sm font-semibold text-ink">{formatBusinessDateTime(lead?.nextFollowUpAt)}</p>
          <p className={`mt-1 text-xs font-black uppercase tracking-[0.12em] ${toneClasses[state.tone]}`}>{state.label}</p>
        </div>
        <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Last Contacted</p>
          <p className="mt-1 text-sm font-semibold text-ink">{formatBusinessDateTime(lead?.lastContactedAt)}</p>
        </div>
      </div>
    </Card>
  );
};

export const PipelineValueDisplay = ({ value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Expected / Pipeline Value</p>
    <p className="mt-1 text-lg font-black text-ink">{formatPipelineValue(value)}</p>
  </div>
);

export { formatBusinessDateTime as formatDateTime };
