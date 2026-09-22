import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable } from "../../../shared/components";
import { formatBusinessDateTime, formatMoney } from "../../../shared/utils";
import DSRStatusBadge from "./DSRStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString();
};

const reading = (value) => (typeof value === "number" ? value : "—");

/**
 * The paper-form rows of a DSR. A table on a desktop screen, where the
 * columns line up across visits; one card per visit on a phone, where
 * seven columns would mean dragging sideways to read a single call.
 */
function VisitsTable({ visits }) {
  const columns = [
    {
      key: "index",
      header: "#",
      hideOnCard: true,
      cellClassName: "text-muted",
      cell: ({ index }) => index + 1,
    },
    {
      key: "route",
      header: "Visit route",
      cellClassName: "text-ink",
      cell: ({ visit }) => visit.route || "—",
    },
    {
      key: "retailer",
      header: "Retailer details",
      role: "title",
      cell: ({ visit }) => (
        <>
          <span className="block font-bold text-ink">{visit.retailerName}</span>
          {visit.retailerPhone ? (
            <a className="block font-semibold text-forest md:font-normal md:text-muted" href={`tel:${visit.retailerPhone}`}>
              {visit.retailerPhone}
            </a>
          ) : null}
          {visit.retailerPlace ? <span className="block text-muted">{visit.retailerPlace}</span> : null}
        </>
      ),
    },
    {
      key: "meter",
      header: "Meter (km)",
      cellClassName: "whitespace-nowrap text-ink",
      cell: ({ visit }) => (
        <>
          {reading(visit.meterFrom)} → {reading(visit.meterTo)}
          {typeof visit.meterFrom === "number" && typeof visit.meterTo === "number" ? (
            <span className="block font-bold">
              {Math.round((visit.meterTo - visit.meterFrom) * 10) / 10} km
            </span>
          ) : null}
        </>
      ),
    },
    {
      key: "amountReceived",
      header: "Amount received",
      cellClassName: "whitespace-nowrap font-bold text-ink",
      cell: ({ visit }) => (visit.amountReceived ? formatMoney(visit.amountReceived) : "—"),
    },
    {
      key: "order",
      header: "Order received",
      cellClassName: "text-ink",
      cell: ({ visit }) => (
        <>
          {visit.orderAmount ? <span className="block font-bold">{formatMoney(visit.orderAmount)}</span> : "—"}
          {visit.orderNumbers?.length ? (
            <span className="block text-muted">{visit.orderNumbers.join(", ")}</span>
          ) : null}
        </>
      ),
    },
    {
      key: "products",
      header: "Materials order details",
      cellClassName: "text-ink",
      cardClassName: "col-span-2",
      cell: ({ visit }) =>
        visit.products?.length
          ? visit.products.map((line, lineIndex) => (
              <span className="block" key={`${line.productName}-${lineIndex}`}>
                {line.productName}
                {typeof line.quantity === "number"
                  ? ` × ${line.quantity}${line.unit ? ` ${line.unit}` : ""}`
                  : ""}
              </span>
            ))
          : "—",
    },
  ];

  const rows = visits.map((visit, index) => ({ index, visit }));

  return (
    <div className="mt-3">
      <DataTable
        columns={columns}
        minWidth="900px"
        rowKey={({ index, visit }) => `${visit.retailerName}-${index}`}
        rows={rows}
        theadClassName="bg-mint/30 text-xs font-black uppercase text-forest"
      />
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
