import Card from "../../../shared/components/Card";
import { formatInvoiceAmount } from "../utils";

// Literal class strings, never assembled from a `tone` prop at runtime —
// Tailwind's build-time scanner only picks up classes it can see written
// out in full somewhere in the source, so a `text-${tone}` interpolation
// would silently produce no styling in the production bundle.
const TONE_CLASSES = Object.freeze({
  ink: "text-ink",
  red: "text-red-700",
  green: "text-green-700",
  orange: "text-orange-700",
});

const StatCard = ({ label, value, tone = "ink" }) => (
  <Card className="p-5">
    <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</p>
    <p className={`mt-2 text-2xl font-black ${TONE_CLASSES[tone] || TONE_CLASSES.ink}`}>{value}</p>
  </Card>
);

// Prompt 51's actual authoritative total — `GET /invoices/summary`
// (invoice.service.js#getSummary), a real server-side aggregation over
// every Invoice this user can see, never a client-side sum of whatever
// page of the list happens to be loaded. `outstandingValue` is
// specifically `SUM(dueAmount) WHERE status = ISSUED` — DRAFT/CANCELLED
// invoices never contribute, matching the backend's own definition.
export default function InvoiceOutstandingSummary({ summaryState }) {
  const summary = summaryState?.data;

  if (summaryState?.isLoading) {
    return <p className="text-sm text-muted">Loading outstanding summary...</p>;
  }
  if (summaryState?.isError) {
    return <p className="text-sm font-semibold text-red-700">{summaryState.errorMessage}</p>;
  }
  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Outstanding Value" tone="red" value={formatInvoiceAmount(summary.outstandingValue)} />
      <StatCard label="Total Invoiced Value" value={formatInvoiceAmount(summary.totalInvoicedValue)} />
      <StatCard label="Total Paid Value" tone="green" value={formatInvoiceAmount(summary.totalPaidValue)} />
      <StatCard label="Overdue Invoices" tone="orange" value={summary.overdueInvoices ?? 0} />
    </div>
  );
}
