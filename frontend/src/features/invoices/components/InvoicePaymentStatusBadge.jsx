import Badge from "../../../shared/components/Badge";
import { INVOICE_PAYMENT_STATUS } from "../constants";
import { formatInvoicePaymentStatus } from "../utils";

const statusClasses = {
  [INVOICE_PAYMENT_STATUS.UNPAID]: "bg-red-50 text-red-800 ring-red-200",
  [INVOICE_PAYMENT_STATUS.PARTIALLY_PAID]: "bg-amber-50 text-amber-900 ring-amber-200",
  [INVOICE_PAYMENT_STATUS.PAID]: "bg-green-50 text-green-800 ring-green-200",
  [INVOICE_PAYMENT_STATUS.OVERDUE]: "bg-orange-100 text-orange-900 ring-orange-300",
};

const badgeClass = (status) =>
  `rounded-md ring-1 ${statusClasses[status] || "bg-white text-muted ring-forest/15"}`;

// Named for the field it actually renders (Invoice.paymentStatus) rather
// than phase6.md Prompt 17's generic "PaymentStatusBadge" — that generic
// name would be ambiguous here, since Order also carries its own
// (differently-valued, no OVERDUE) paymentStatus field. See
// features/invoices/constants/invoice.constants.js for the same placement
// reasoning.
export default function InvoicePaymentStatusBadge({ status }) {
  return <Badge className={badgeClass(status)}>{formatInvoicePaymentStatus(status)}</Badge>;
}
