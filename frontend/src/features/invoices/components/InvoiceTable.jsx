import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBusinessDateTime, getBusinessDaysOverdue } from "../../../shared/utils";
import { INVOICE_PAYMENT_STATUS } from "../constants";
import { formatInvoiceAmount } from "../utils";
import InvoicePaymentStatusBadge from "./InvoicePaymentStatusBadge";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

// Prompt 52: same real, backend-confirmed OVERDUE status as InvoiceHeader
// — this only adds a day-count caption under an already-OVERDUE badge, in
// the business timezone, never computing overdue-ness itself.
const overdueHint = (invoice) => {
  if (invoice.paymentStatus !== INVOICE_PAYMENT_STATUS.OVERDUE) return null;
  const days = getBusinessDaysOverdue(invoice.dueDate);
  return days ? `${days}d overdue` : null;
};

export default function InvoiceTable({ detailPath, invoices = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Invoice Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Invoice Status</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              <th className="px-4 py-3 text-right">Paid Amount</th>
              <th className="px-4 py-3 text-right">Due Amount</th>
              <th className="px-4 py-3">Invoice Date</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {invoices.map((invoice) => (
              <tr className="align-top transition hover:bg-mint/35" key={invoice._id}>
                <td className="px-4 py-3 font-black text-forest">{invoice.invoiceNumber}</td>
                <td className="px-4 py-3 text-ink">{invoice.customer?.name || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{invoice.order?.orderNumber || "Not Set"}</td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-4 py-3">
                  <InvoicePaymentStatusBadge status={invoice.paymentStatus} />
                  {overdueHint(invoice) ? (
                    <p className="mt-1 text-xs font-semibold text-orange-800">{overdueHint(invoice)}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right font-bold text-ink">
                  {formatInvoiceAmount(invoice.grandTotal)}
                </td>
                <td className="px-4 py-3 text-right text-ink">{formatInvoiceAmount(invoice.paidAmount)}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatInvoiceAmount(invoice.dueAmount)}
                </td>
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(invoice.invoiceDate)}</td>
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(invoice.dueDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${invoice.invoiceNumber}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={detailPath(invoice)}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
