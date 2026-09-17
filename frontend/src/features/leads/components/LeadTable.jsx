import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBusinessDateTime } from "../../../shared/utils";
import { LeadPriorityBadge, LeadSourceBadge, LeadStatusBadge } from "./LeadBadges";
import { formatEmployeeSummary, formatGeoSummary, formatPipelineValue } from "../utils";

export default function LeadTable({
  detailPath,
  leads = [],
  showAssignments = true,
  showSource = true,
  showPipelineValue = true,
  // Org-hierarchy migration (Phase F09) — region/district, captured once
  // at lead creation and never recomputed on transfer (see the backend's
  // own Phase 10 design note). Defaults to mirroring showAssignments: the
  // two describe the same "who/where this belongs to" context, so any
  // view that already hides assignments for being redundant (e.g. an
  // employee's own lead list) hides location too, unless overridden.
  showLocation = showAssignments,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Lead Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Phone</th>
              {showSource ? <th className="px-4 py-3">Source</th> : null}
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Handled By</th>
              {showAssignments ? <th className="px-4 py-3">Manager</th> : null}
              {showAssignments ? <th className="px-4 py-3">Employee</th> : null}
              {showLocation ? <th className="px-4 py-3">Region</th> : null}
              {showLocation ? <th className="px-4 py-3">District</th> : null}
              {showPipelineValue ? <th className="px-4 py-3">Expected Value</th> : null}
              <th className="px-4 py-3">Next Follow-Up</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {leads.map((lead) => (
              <tr className="align-top transition hover:bg-mint/35" key={lead._id}>
                <td className="px-4 py-3 font-black text-forest">{lead.leadCode || "Pending"}</td>
                <td className="px-4 py-3 font-black text-ink">
                  <span className="inline-flex items-center gap-2">
                    {lead.pendingActionRequests > 0 ? (
                      <span
                        aria-label={`${lead.pendingActionRequests} pending request${lead.pendingActionRequests > 1 ? "s" : ""}`}
                        className="relative flex h-2.5 w-2.5 shrink-0"
                        data-lead-request-dot
                        title="Your team is waiting on a request for this lead"
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:hidden" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                      </span>
                    ) : null}
                    {lead.name || "Unnamed Lead"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{lead.companyName || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{lead.phone || "Not Set"}</td>
                {showSource ? (
                  <td className="px-4 py-3">
                    <LeadSourceBadge source={lead.source} />
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <LeadPriorityBadge priority={lead.priority} />
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-muted" data-lead-handled-by>
                  {lead.handledBy ? (
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-ink">{lead.handledBy.name}</span>
                      {lead.handledBy.roleLabel ? (
                        <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-black text-forest">{lead.handledBy.roleLabel}</span>
                      ) : null}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                {showAssignments ? (
                  <td className="px-4 py-3 text-muted">{formatEmployeeSummary(lead.assignedManager)}</td>
                ) : null}
                {showAssignments ? (
                  <td className="px-4 py-3 text-muted">{formatEmployeeSummary(lead.assignedEmployee)}</td>
                ) : null}
                {showLocation ? <td className="px-4 py-3 text-muted">{formatGeoSummary(lead.region)}</td> : null}
                {showLocation ? <td className="px-4 py-3 text-muted">{formatGeoSummary(lead.district)}</td> : null}
                {showPipelineValue ? (
                  <td className="px-4 py-3 font-bold text-ink">{formatPipelineValue(lead.expectedValue)}</td>
                ) : null}
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(lead.nextFollowUpAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${lead.name || "lead"}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={detailPath(lead)}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
