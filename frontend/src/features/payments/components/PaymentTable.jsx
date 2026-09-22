import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable } from "../../../shared/components";
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
  const columns = [
    {
      key: "paymentNumber",
      header: "Payment Number",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (payment) => payment.paymentNumber,
    },
    {
      key: "invoice",
      header: "Invoice",
      // The only link in the row, so on a phone it belongs in the card's
      // action strip rather than buried among the labelled fields.
      role: "actions",
      cell: (payment) =>
        invoiceDetailPathFor && payment.invoice ? (
          <Link
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-forest hover:underline md:min-h-0"
            to={invoiceDetailPathFor(payment.invoice)}
          >
            <Eye className="h-3.5 w-3.5" />
            View Invoice
          </Link>
        ) : (
          <span className="text-muted">Not Set</span>
        ),
    },
    {
      key: "customer",
      header: "Customer",
      cellClassName: "text-ink",
      cell: (payment) => payment.customer?.name || "Not Set",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cellClassName: "font-bold text-ink",
      cell: (payment) => formatPaymentAmount(payment.amount),
    },
    {
      key: "method",
      header: "Method",
      cell: (payment) => <PaymentMethodFormatter method={payment.method} />,
    },
    {
      key: "reference",
      header: "Reference",
      cellClassName: "text-muted",
      cell: (payment) => payment.transactionReference || "-",
    },
    {
      key: "paymentDate",
      header: "Payment Date",
      cellClassName: "text-muted",
      cell: (payment) => formatBusinessDateTime(payment.paymentDate),
    },
  ];

  return <DataTable columns={columns} minWidth="980px" rows={payments} />;
}
