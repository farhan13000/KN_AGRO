import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBusinessDateTime } from "../../../shared/utils";
import { formatPaymentAmount } from "../utils";
import PaymentMethodFormatter from "./PaymentMethodFormatter";

// No "Recorded By" column — verified directly against payment.service.js's
// global listPayments aggregation: its own `$project` stage doesn't even
// include `recordedBy`/`recordedByEmployee` (unlike the per-invoice list,
// which at least carries the raw, still-unpopulated ObjectId). Neither
// list anywhere populates a name for it, so there is no human-readable
// "who recorded this" data to show, in either list — showing a raw Mongo
// ID under a "Recorded By" header would be actively misleading, not
// merely incomplete.
//
// The Invoice column links to the Invoice detail page using the raw
// `payment.invoice` id (the global list's own $project doesn't $lookup an
// invoiceNumber for it, only the Customer/Order relations get resolved) —
// real, working link, just no invoice-number text to show alongside it.
export default function PaymentTable({ invoiceDetailPathFor, payments = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Payment Number</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Payment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {payments.map((payment) => (
              <tr className="align-top transition hover:bg-mint/35" key={payment._id}>
                <td className="px-4 py-3 font-black text-forest">{payment.paymentNumber}</td>
                <td className="px-4 py-3">
                  {invoiceDetailPathFor && payment.invoice ? (
                    <Link
                      className="inline-flex items-center gap-1 font-semibold text-forest hover:underline"
                      to={invoiceDetailPathFor(payment.invoice)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Invoice
                    </Link>
                  ) : (
                    "Not Set"
                  )}
                </td>
                <td className="px-4 py-3 text-ink">{payment.customer?.name || "Not Set"}</td>
                <td className="px-4 py-3 text-right font-bold text-ink">{formatPaymentAmount(payment.amount)}</td>
                <td className="px-4 py-3">
                  <PaymentMethodFormatter method={payment.method} />
                </td>
                <td className="px-4 py-3 text-muted">{payment.transactionReference || "-"}</td>
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(payment.paymentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
