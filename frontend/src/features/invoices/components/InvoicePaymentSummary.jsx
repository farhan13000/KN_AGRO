import { formatInvoiceAmount } from "../utils";
import InvoicePaymentStatusBadge from "./InvoicePaymentStatusBadge";

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className="text-ink">{label}</span>
    <span className="font-semibold text-ink">{value}</span>
  </div>
);

// Reads only `invoice.paymentSummary` (the backend's own
// {paidAmount, dueAmount, paymentStatus} triple, already effective/
// deterministic on the detail response) — never sums a separate payment
// list itself, which would risk drifting from the backend's own
// concurrency-safe running total (see the atomic findOneAndUpdate overpay
// guard in PHASE6_FRONTEND_API_CONTRACT.md).
export default function InvoicePaymentSummary({ invoice }) {
  const summary = invoice.paymentSummary || {};

  return (
    <div className="divide-y divide-forest/10">
      <Row label="Grand Total" value={formatInvoiceAmount(invoice.grandTotal)} />
      <Row label="Paid Amount" value={formatInvoiceAmount(summary.paidAmount)} />
      <Row label="Due Amount" value={formatInvoiceAmount(summary.dueAmount)} />
      <div className="flex items-center justify-between py-1.5 text-sm">
        <span className="text-ink">Payment Status</span>
        <InvoicePaymentStatusBadge status={summary.paymentStatus} />
      </div>
    </div>
  );
}
