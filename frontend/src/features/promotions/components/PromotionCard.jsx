import { ArrowRight } from "lucide-react";
import PromotionStatusBadge from "./PromotionStatusBadge";

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

const roleName = (role) => (role?.name ? role.name.toUpperCase() : "—");

/**
 * One promotion, rendered the same way everywhere it appears. `actions`
 * is whatever the surrounding context is allowed to offer (approve/reject
 * on the approvals queue, nothing on an employee's read-only history).
 */
export default function PromotionCard({ actions = null, promotion, showEmployee = true }) {
  const employeeName = promotion.employee?.user?.name || promotion.employee?.employeeCode || "Unknown";

  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showEmployee ? <p className="text-sm font-black text-ink">{employeeName}</p> : null}
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-semibold text-ink">{roleName(promotion.currentRole)}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-agriculture" />
            <span className="font-semibold text-ink">{roleName(promotion.proposedRole)}</span>
          </p>
        </div>
        <PromotionStatusBadge status={promotion.approvalStatus} />
      </div>

      <p className="mt-3 text-sm text-muted">
        <span className="text-xs font-black uppercase tracking-wide text-muted">Reason</span>{" "}
        {promotion.reason}
      </p>

      {promotion.reviewComment ? (
        <p className="mt-2 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Comment</span>{" "}
          {promotion.reviewComment}
        </p>
      ) : null}

      <p className="mt-3 text-xs font-semibold text-muted">
        {promotion.recommendedBy?.name ? `Recommended by ${promotion.recommendedBy.name}` : null}
        {formatDate(promotion.recommendationDate) ? ` on ${formatDate(promotion.recommendationDate)}` : null}
        {promotion.finalApprover?.name ? ` · Approved by ${promotion.finalApprover.name}` : null}
        {formatDate(promotion.completedAt) ? ` · Completed ${formatDate(promotion.completedAt)}` : null}
      </p>

      {actions ? <div className="mt-4">{actions}</div> : null}
    </li>
  );
}
