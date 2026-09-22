import { DataTable } from "../../../shared/components";
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

  const columns = [
    {
      key: "paymentNumber",
      header: "Payment Number",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (payment) => payment.paymentNumber,
    },
    {
      key: "method",
      header: "Method",
      cell: (payment) => <PaymentMethodFormatter method={payment.method} />,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cellClassName: "font-semibold text-ink",
      cell: (payment) => formatPaymentAmount(payment.amount),
    },
    {
      key: "paymentDate",
      header: "Payment Date",
      cellClassName: "text-muted",
      cell: (payment) => formatBusinessDateTime(payment.paymentDate),
    },
    {
      key: "reference",
      header: "Reference",
      cellClassName: "text-muted",
      cell: (payment) => payment.transactionReference || "-",
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (payment) => <span className="text-xs font-bold text-muted">{payment.status || "-"}</span>,
    },
    {
      key: "createdAt",
      header: "Created At",
      cellClassName: "text-muted",
      cell: (payment) => formatBusinessDateTime(payment.createdAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      minWidth="640px"
      rows={payments}
      theadClassName="bg-mint/40 text-xs font-black uppercase text-muted"
    />
  );
}
