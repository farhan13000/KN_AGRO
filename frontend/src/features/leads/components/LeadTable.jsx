import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, rowActionClass } from "../../../shared/components";
import { formatBusinessDateTime } from "../../../shared/utils";
import { LeadPriorityBadge, LeadSourceBadge, LeadStatusBadge } from "./LeadBadges";
import { formatEmployeeSummary, formatGeoSummary, formatPipelineValue } from "../utils";

export default function LeadTable({
  detailPath,
  leads = [],
  showAssignments = true,
  showSource = true,
  showPipelineValue = true,
  // The buyer's own state/district, from their address. Defaults to
  // mirroring showAssignments: the two describe the same "who/where this
  // belongs to" context, so any view that already hides assignments for
  // being redundant (e.g. an employee's own lead list) hides location
  // too, unless overridden.
  showLocation = showAssignments,
}) {
  const columns = [
    {
      key: "leadCode",
      header: "Lead Code",
      cellClassName: "font-black text-forest",
      cell: (lead) => lead.leadCode || "Pending",
    },
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-black text-ink",
      cell: (lead) => (
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
      ),
    },
    {
      key: "companyName",
      header: "Company",
      cellClassName: "text-muted",
      cell: (lead) => lead.companyName || "Not Set",
    },
    {
      key: "phone",
      header: "Phone",
      cellClassName: "text-muted",
      // A phone number on a phone should place the call. It is the single
      // most likely thing a field employee wants to do with this row.
      cell: (lead) =>
        lead.phone ? (
          <a className="font-semibold text-forest md:font-normal md:text-muted" href={`tel:${lead.phone}`}>
            {lead.phone}
          </a>
        ) : (
          "Not Set"
        ),
    },
    showSource && {
      key: "source",
      header: "Source",
      cell: (lead) => <LeadSourceBadge source={lead.source} />,
    },
    {
      key: "priority",
      header: "Priority",
      role: "badge",
      cell: (lead) => <LeadPriorityBadge priority={lead.priority} />,
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (lead) => <LeadStatusBadge status={lead.status} />,
    },
    {
      key: "handledBy",
      header: "Handled By",
      cellClassName: "text-muted",
      cell: (lead) => (
        <span data-lead-handled-by>
          {lead.handledBy ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-ink">{lead.handledBy.name}</span>
              {lead.handledBy.roleLabel ? (
                <span className="rounded bg-mint px-1.5 py-0.5 text-[10px] font-black text-forest">
                  {lead.handledBy.roleLabel}
                </span>
              ) : null}
            </span>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    showAssignments && {
      key: "assignedManager",
      header: "Manager",
      cellClassName: "text-muted",
      cell: (lead) => formatEmployeeSummary(lead.assignedManager),
    },
    showAssignments && {
      key: "assignedEmployee",
      header: "Employee",
      cellClassName: "text-muted",
      cell: (lead) => formatEmployeeSummary(lead.assignedEmployee),
    },
    showLocation && {
      key: "state",
      header: "State",
      cellClassName: "text-muted",
      cell: (lead) => formatGeoSummary(lead.address?.state),
    },
    showLocation && {
      key: "district",
      header: "District",
      cellClassName: "text-muted",
      cell: (lead) => formatGeoSummary(lead.address?.district),
    },
    showPipelineValue && {
      key: "expectedValue",
      header: "Expected Value",
      cellClassName: "font-bold text-ink",
      cell: (lead) => formatPipelineValue(lead.expectedValue),
    },
    {
      key: "nextFollowUpAt",
      header: "Next Follow-Up",
      cellClassName: "text-muted",
      cell: (lead) => formatBusinessDateTime(lead.nextFollowUpAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (lead) => (
        <div className="flex justify-end">
          <Link aria-label={`View ${lead.name || "lead"}`} className={rowActionClass} to={detailPath(lead)}>
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ].filter(Boolean);

  return <DataTable columns={columns} minWidth="1120px" rows={leads} />;
}
