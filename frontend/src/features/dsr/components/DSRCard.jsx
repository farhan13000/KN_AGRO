import { formatBusinessDateTime, formatMoney } from "../../../shared/utils";
import DSRStatusBadge from "./DSRStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString();
};

/**
 * One DSR, rendered the same way everywhere it appears. `actions` is
 * whatever the surrounding context is allowed to offer (Review/
 * Acknowledge on a team queue, nothing on a self-service history list).
 */
export default function DSRCard({ actions = null, dsr, showEmployee = false }) {
  const employeeName = dsr.employee?.user?.name || dsr.employee?.employeeCode || "Unknown";

  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showEmployee ? <p className="text-sm font-black text-ink">{employeeName}</p> : null}
          <p className="mt-1 text-sm font-semibold text-ink">{formatDate(dsr.date)}</p>
        </div>
        <DSRStatusBadge status={dsr.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Customer Visits</dt>
          <dd className="mt-1 font-semibold text-ink">{dsr.customerVisits ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Orders</dt>
          <dd className="mt-1 font-semibold text-ink">{dsr.ordersGenerated ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Sales Amount</dt>
          <dd className="mt-1 font-semibold text-ink">{formatMoney(dsr.salesAmount)}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">New Leads</dt>
          <dd className="mt-1 font-semibold text-ink">{dsr.newLeadsGenerated ?? 0}</dd>
        </div>
      </dl>

      {dsr.keyActivities ? (
        <p className="mt-3 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Key Activities</span> {dsr.keyActivities}
        </p>
      ) : null}

      <p className="mt-3 text-xs font-semibold text-muted">
        {dsr.reviewedAt ? `Reviewed ${formatBusinessDateTime(dsr.reviewedAt)}` : null}
        {dsr.acknowledgedAt ? ` · Acknowledged ${formatBusinessDateTime(dsr.acknowledgedAt)}` : null}
      </p>

      {actions ? <div className="mt-4">{actions}</div> : null}
    </li>
  );
}
