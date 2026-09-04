import { Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
// Narrow subpath import — only the one component is needed here, not the
// whole Payments feature's forms/hooks/services graph.
import RecordPaymentAction from "../../payments/components/RecordPaymentAction";
import InvoiceAddressSnapshotSection from "./InvoiceAddressSnapshotSection";
import InvoiceAmountSummary from "./InvoiceAmountSummary";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceItemTable from "./InvoiceItemTable";
import InvoiceLifecycleActions from "./InvoiceLifecycleActions";
import InvoicePaymentHistoryTable from "./InvoicePaymentHistoryTable";
import InvoicePaymentSummary from "./InvoicePaymentSummary";
import { getInvoiceCapabilities } from "../utils";

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value || "Not Set"}</dd>
  </div>
);

// Prompt 38's shared detail composition: Header, Actions (Prompts 42/43,
// landing this batch), Customer, Source Order, Address Snapshots (Prompt
// 39), Items (Prompt 40), Commercial Summary, Payment Summary, Record
// Payment (Prompts 45/46, gated by canRecordPayment), Payment History.
//
// The "Customer" card below is deliberately NOT called "Customer
// Snapshot" — verified directly against invoice.model.js that `customer`
// is a live ObjectId reference to the Customer document (populated fresh
// on every read), unlike billingAddressSnapshot/shippingAddressSnapshot,
// which really are frozen copies. If this customer's name is edited later
// (Prompt 22's Edit form), an already-generated invoice will show the
// UPDATED name here — only the address below is genuinely historical. The
// caption makes that distinction explicit rather than implying the whole
// section is frozen.
export default function InvoiceDetailView({
  customerDetailPath = "",
  invoice,
  onMutationSuccess,
  onPaymentRecorded,
  orderDetailPath = "",
  paymentHistoryState,
  printPath = "",
  roleLabel = "CRM",
}) {
  const { hasPermission, role } = useAuth();
  const { canRecordPayment } = getInvoiceCapabilities({ hasPermission, invoice, role });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <InvoiceHeader invoice={invoice} roleLabel={roleLabel} />
        {printPath ? (
          <Button className="shrink-0" to={printPath} variant="secondary">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        ) : null}
      </div>

      <InvoiceLifecycleActions invoice={invoice} onSuccess={onMutationSuccess} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Customer</h2>
          <p className="mt-1 text-xs font-semibold text-muted">
            Reflects the current Customer record, not frozen at invoice time — unlike the address below.
          </p>
          <dl className="mt-4 grid gap-3">
            <DetailRow label="Name" value={invoice.customer?.name} />
            <DetailRow label="Company" value={invoice.customer?.companyName} />
            <DetailRow label="Phone" value={invoice.customer?.phone} />
            <DetailRow label="Email" value={invoice.customer?.email} />
          </dl>
          {customerDetailPath ? (
            <Link className="mt-3 inline-block text-sm font-bold text-forest hover:underline" to={customerDetailPath}>
              View Customer
            </Link>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Source Order</h2>
          <dl className="mt-4 grid gap-3">
            <DetailRow label="Order Number" value={invoice.order?.orderNumber} />
            <DetailRow label="Order Status" value={invoice.order?.orderStatus} />
          </dl>
          {orderDetailPath ? (
            <Link className="mt-3 inline-block text-sm font-bold text-forest hover:underline" to={orderDetailPath}>
              View Order
            </Link>
          ) : null}
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-black text-ink">Address (frozen at invoice date)</h2>
        <InvoiceAddressSnapshotSection invoice={invoice} />
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Items</h2>
        <div className="mt-4">
          <InvoiceItemTable items={invoice.items || []} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Commercial Summary</h2>
          <div className="mt-4">
            <InvoiceAmountSummary invoice={invoice} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Payment Summary</h2>
          <div className="mt-4">
            <InvoicePaymentSummary invoice={invoice} />
          </div>
        </Card>
      </div>

      {canRecordPayment ? <RecordPaymentAction invoice={invoice} onRecorded={onPaymentRecorded} /> : null}

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Payment History</h2>
        <div className="mt-4">
          <InvoicePaymentHistoryTable paymentHistoryState={paymentHistoryState} />
        </div>
      </Card>
    </div>
  );
}
