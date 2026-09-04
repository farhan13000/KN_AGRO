import { formatBusinessDateTime } from "../../../shared/utils";
// Narrow subpath imports (not the payments feature's root barrel) — this
// only needs the formatter/component, not the whole Payments UI/hooks
// graph, keeping the Invoices bundle from pulling in unrelated code.
import PaymentMethodFormatter from "../../payments/components/PaymentMethodFormatter";
import { formatPaymentAmount } from "../../payments/utils/paymentFormatters";

// Prompt 48's recommended columns are Payment Number/Amount/Method/
// Reference/Payment Date/Recorded By/Status if available/Created At.
// Status and Created At are both genuinely present on the backend
// response (payment.serializer.js) and shown below. "Recorded By" is
// deliberately omitted — verified directly against payment.service.js
// that `recordedBy`/`recordedByEmployee` are never `.populate()`d
// anywhere in this codebase, so the value here would just be a raw Mongo
// ObjectId, not a name. Showing that under a "Recorded By" header would be
// actively misleading, not merely incomplete, so it's left out rather than
// displaying an ID nobody can read.
//
// Read-only list only — no edit/delete anywhere, matching Payment's own
// append-only design (Prompt 48's "No normal edit/delete"). `paymentHistoryState`
// is passed in as a prop, owned by InvoiceDetailRouteView's own
// `useInvoicePaymentHistory` call, matching the exact CustomerHistoryPanel
// pattern from Batch 2 (avoids a duplicate fetch).
export default function InvoicePaymentHistoryTable({ paymentHistoryState }) {
  const payments = paymentHistoryState?.data?.payments || [];

  if (paymentHistoryState?.isLoading) {
    return <p className="text-sm text-muted">Loading payment history...</p>;
  }
  if (paymentHistoryState?.isError) {
    return <p className="text-sm font-semibold text-red-700">{paymentHistoryState.errorMessage}</p>;
  }
  if (!payments.length) {
    return <p className="text-sm text-muted">No payments recorded against this invoice yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/40 text-xs font-black uppercase text-muted">
            <tr>
              <th className="px-4 py-2">Payment Number</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2">Payment Date</th>
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="px-4 py-2 font-black text-forest">{payment.paymentNumber}</td>
                <td className="px-4 py-2">
                  <PaymentMethodFormatter method={payment.method} />
                </td>
                <td className="px-4 py-2 text-right font-semibold text-ink">
                  {formatPaymentAmount(payment.amount)}
                </td>
                <td className="px-4 py-2 text-muted">{formatBusinessDateTime(payment.paymentDate)}</td>
                <td className="px-4 py-2 text-muted">{payment.transactionReference || "-"}</td>
                <td className="px-4 py-2 text-muted">{payment.status || "-"}</td>
                <td className="px-4 py-2 text-muted">{formatBusinessDateTime(payment.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
