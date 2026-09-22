import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, rowActionClass } from "../../../shared/components";
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
  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice Number",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (invoice) => invoice.invoiceNumber,
    },
    {
      key: "customer",
      header: "Customer",
      cellClassName: "text-ink",
      cell: (invoice) => invoice.customer?.name || "Not Set",
    },
    {
      key: "order",
      header: "Order",
      cellClassName: "text-muted",
      cell: (invoice) => invoice.order?.orderNumber || "Not Set",
    },
    {
      key: "status",
      header: "Invoice Status",
      role: "badge",
      cell: (invoice) => <InvoiceStatusBadge status={invoice.status} />,
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      role: "badge",
      cell: (invoice) => (
        <>
          <InvoicePaymentStatusBadge status={invoice.paymentStatus} />
          {overdueHint(invoice) ? (
            <p className="mt-1 text-xs font-semibold text-orange-800">{overdueHint(invoice)}</p>
          ) : null}
        </>
      ),
    },
    {
      key: "grandTotal",
      header: "Grand Total",
      align: "right",
      cellClassName: "font-bold text-ink",
      cell: (invoice) => formatInvoiceAmount(invoice.grandTotal),
    },
    {
      key: "paidAmount",
      header: "Paid Amount",
      align: "right",
      cellClassName: "text-ink",
      cell: (invoice) => formatInvoiceAmount(invoice.paidAmount),
    },
    {
      key: "dueAmount",
      header: "Due Amount",
      align: "right",
      cellClassName: "font-semibold text-ink",
      cell: (invoice) => formatInvoiceAmount(invoice.dueAmount),
    },
    {
      key: "invoiceDate",
      header: "Invoice Date",
      cellClassName: "text-muted",
      cell: (invoice) => formatBusinessDateTime(invoice.invoiceDate),
    },
    {
      key: "dueDate",
      header: "Due Date",
      cellClassName: "text-muted",
      cell: (invoice) => formatBusinessDateTime(invoice.dueDate),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (invoice) => (
        <div className="flex justify-end">
          <Link
            aria-label={`View ${invoice.invoiceNumber}`}
            className={rowActionClass}
            to={detailPath(invoice)}
          >
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="1180px" rows={invoices} />;
}
