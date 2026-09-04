import { ArrowRight } from "lucide-react";
import { formatMoney } from "../../../shared/utils";
import SalaryProposalStatusBadge from "./SalaryProposalStatusBadge";

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

/**
 * One salary proposal, rendered the same way everywhere it appears.
 * `actions` is whatever the surrounding context is allowed to offer
 * (review/approve/reject/finalize on the pipeline view, nothing on an
 * employee's read-only history).
 */
export default function SalaryProposalCard({ actions = null, proposal, showEmployee = true }) {
  const employeeName = proposal.employee?.user?.name || proposal.employee?.employeeCode || "Unknown";

  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showEmployee ? <p className="text-sm font-black text-ink">{employeeName}</p> : null}
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-semibold text-ink">{formatMoney(proposal.currentSalary)}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-agriculture" />
            <span className="font-semibold text-ink">{formatMoney(proposal.proposedSalary)}</span>
          </p>
        </div>
        <SalaryProposalStatusBadge status={proposal.approvalStatus} />
      </div>

      <p className="mt-3 text-sm text-muted">
        <span className="text-xs font-black uppercase tracking-wide text-muted">Reason</span> {proposal.changeReason}
      </p>

      {proposal.rejectionReason ? (
        <p className="mt-2 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Rejection Reason</span>{" "}
          {proposal.rejectionReason}
        </p>
      ) : null}

      <p className="mt-3 text-xs font-semibold text-muted">
        {formatDate(proposal.effectiveDate) ? `Effective ${formatDate(proposal.effectiveDate)}` : null}
        {proposal.proposedBy?.name ? ` · Proposed by ${proposal.proposedBy.name}` : null}
        {proposal.reviewedBy?.name ? ` · Reviewed by ${proposal.reviewedBy.name}` : null}
        {proposal.approvedBy?.name ? ` · Approved by ${proposal.approvedBy.name}` : null}
      </p>

      {actions ? <div className="mt-4">{actions}</div> : null}
    </li>
  );
}
