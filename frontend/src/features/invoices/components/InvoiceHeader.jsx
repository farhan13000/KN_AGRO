import { formatBusinessDateTime, getBusinessDaysOverdue } from "../../../shared/utils";
import { INVOICE_PAYMENT_STATUS, INVOICE_STATUS } from "../constants";
import InvoicePaymentStatusBadge from "./InvoicePaymentStatusBadge";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

// Prompt 52: the OVERDUE badge itself already comes straight from the
// backend's own effective, always-fresh `paymentStatus` (verified in
// Batches 4-5) — this hint never decides overdue-ness itself, it only adds
// a "X days overdue" caption once the backend has already said so, computed
// in the business timezone (never the viewer's browser timezone).
const OverdueHint = ({ invoice }) => {
  if (invoice.paymentStatus !== INVOICE_PAYMENT_STATUS.OVERDUE) return null;
  const days = getBusinessDaysOverdue(invoice.dueDate);
  if (!days) return null;

  return (
    <p className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-900">
      {days} {days === 1 ? "day" : "days"} overdue (due {formatBusinessDateTime(invoice.dueDate)})
    </p>
  );
};

export default function InvoiceHeader({ invoice, roleLabel = "CRM" }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black text-ink">{invoice.invoiceNumber || "Not Set"}</h1>
        <InvoiceStatusBadge status={invoice.status} />
        <InvoicePaymentStatusBadge status={invoice.paymentStatus} />
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        {invoice.customer?.name || "Unknown customer"} · Invoice date{" "}
        {formatBusinessDateTime(invoice.invoiceDate)} · Due {formatBusinessDateTime(invoice.dueDate)}
      </p>
      <OverdueHint invoice={invoice} />
      {invoice.status === INVOICE_STATUS.CANCELLED && invoice.cancellationReason ? (
        <p className="mt-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800">
          Cancellation reason: {invoice.cancellationReason}
        </p>
      ) : null}
    </div>
  );
}
