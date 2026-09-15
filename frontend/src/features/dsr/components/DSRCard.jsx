import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBusinessDateTime, formatMoney } from "../../../shared/utils";
import DSRStatusBadge from "./DSRStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString();
};

const reading = (value) => (typeof value === "number" ? value : "—");

/** The paper-form rows of a DSR, as a table. */
function VisitsTable({ visits }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-forest/10">
      <table className="w-full min-w-[900px] divide-y divide-forest/10 text-left text-xs">
        <thead className="bg-mint/30 font-black uppercase text-forest">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Visit route</th>
            <th className="px-3 py-2">Retailer details</th>
            <th className="px-3 py-2">Meter (km)</th>
            <th className="px-3 py-2">Amount received</th>
            <th className="px-3 py-2">Order received</th>
            <th className="px-3 py-2">Materials order details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forest/10 align-top">
          {visits.map((visit, index) => (
            <tr key={`${visit.retailerName}-${index}`}>
              <td className="px-3 py-2 text-muted">{index + 1}</td>
              <td className="px-3 py-2 text-ink">{visit.route || "—"}</td>
              <td className="px-3 py-2">
                <span className="block font-bold text-ink">{visit.retailerName}</span>
                {visit.retailerPhone ? <span className="block text-muted">{visit.retailerPhone}</span> : null}
                {visit.retailerPlace ? <span className="block text-muted">{visit.retailerPlace}</span> : null}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-ink">
                {reading(visit.meterFrom)} → {reading(visit.meterTo)}
                {typeof visit.meterFrom === "number" && typeof visit.meterTo === "number" ? (
                  <span className="block font-bold">{Math.round((visit.meterTo - visit.meterFrom) * 10) / 10} km</span>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-bold text-ink">
                {visit.amountReceived ? formatMoney(visit.amountReceived) : "—"}
              </td>
              <td className="px-3 py-2 text-ink">
                {visit.orderAmount ? <span className="block font-bold">{formatMoney(visit.orderAmount)}</span> : "—"}
                {visit.orderNumbers?.length ? (
                  <span className="block text-muted">{visit.orderNumbers.join(", ")}</span>
                ) : null}
              </td>
              <td className="px-3 py-2 text-ink">
                {visit.products?.length
                  ? visit.products.map((line, lineIndex) => (
                      <span className="block" key={`${line.productName}-${lineIndex}`}>
                        {line.productName}
                        {typeof line.quantity === "number" ? ` × ${line.quantity}${line.unit ? ` ${line.unit}` : ""}` : ""}
                      </span>
                    ))
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * One DSR, rendered the same way everywhere it appears. `actions` is
 * whatever the surrounding context is allowed to offer (Review/
 * Acknowledge on a team queue, nothing on a self-service history list).
 */
export default function DSRCard({ actions = null, dsr, printHref = null, showEmployee = false }) {
  const employeeName = dsr.employee?.user?.name || dsr.employee?.employeeCode || "Unknown";
  const visits = dsr.visits ?? [];

  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showEmployee ? <p className="text-sm font-black text-ink">{employeeName}</p> : null}
          <p className="mt-1 text-sm font-semibold text-ink">{formatDate(dsr.date)}</p>
        </div>
        <DSRStatusBadge status={dsr.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Visits</dt>
          <dd className="mt-1 font-semibold text-ink">{dsr.customerVisits ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Orders</dt>
          <dd className="mt-1 font-semibold text-ink">{dsr.ordersGenerated ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Order Value</dt>
          <dd className="mt-1 font-semibold text-ink">{formatMoney(dsr.salesAmount)}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Amount Received</dt>
          <dd className="mt-1 font-semibold text-ink">{formatMoney(dsr.amountReceived ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Distance</dt>
          <dd className="mt-1 font-semibold text-ink">{typeof dsr.distanceKm === "number" ? `${dsr.distanceKm} km` : "—"}</dd>
        </div>
      </dl>

      {visits.length ? (
        <details className="mt-3" open={visits.length <= 3}>
          <summary className="cursor-pointer text-sm font-bold text-forest">Visit details ({visits.length})</summary>
          <VisitsTable visits={visits} />
        </details>
      ) : null}

      {dsr.keyActivities ? (
        <p className="mt-3 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Key Activities</span> {dsr.keyActivities}
        </p>
      ) : null}

      <p className="mt-3 text-xs font-semibold text-muted">
        {dsr.reviewedAt ? `Reviewed ${formatBusinessDateTime(dsr.reviewedAt)}` : null}
        {dsr.acknowledgedAt ? ` · Acknowledged ${formatBusinessDateTime(dsr.acknowledgedAt)}` : null}
      </p>

      {actions || printHref ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {actions}
          {printHref ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              to={`${printHref}?download=1`}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Link>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
