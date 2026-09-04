import { Printer } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { formatBusinessDateTime } from "../../../shared/utils";
import { formatGeoSummary } from "../utils";
import OrderAmountSummary from "./OrderAmountSummary";
import OrderHeader from "./OrderHeader";
import OrderInventoryReservationSummary from "./OrderInventoryReservationSummary";
import OrderInvoiceSection from "./OrderInvoiceSection";
import OrderItemTable from "./OrderItemTable";
import OrderLifecycleActions from "./OrderLifecycleActions";

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value || "Not Set"}</dd>
  </div>
);

const FULFILLMENT_STAGES = [
  { field: "confirmedAt", label: "Confirmed" },
  { field: "processingAt", label: "Processing" },
  { field: "readyAt", label: "Ready" },
  { field: "dispatchedAt", label: "Dispatched" },
  { field: "deliveredAt", label: "Delivered" },
];

// The shared detail composition (Prompt 25): Header (+ Print, Prompt 54),
// Lifecycle Actions (Prompts 27/28/30-35), Customer, Source Quotation,
// Item Snapshots (Prompt 26), Inventory Reservation (Prompt 29),
// Fulfillment Status, Commercial Summary, Invoice (Prompt 41).
export default function OrderDetailView({
  customerDetailPath = "",
  existingInvoiceState,
  invoiceDetailPathFor,
  inventoryRefreshToken = 0,
  onInvoiceCreated,
  onMutationSuccess,
  order,
  printPath = "",
  quotationDetailPath = "",
  roleLabel = "CRM",
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <OrderHeader order={order} roleLabel={roleLabel} />
        {printPath ? (
          <Button className="shrink-0" to={printPath} variant="secondary">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        ) : null}
      </div>

      <OrderLifecycleActions onSuccess={onMutationSuccess} order={order} />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Customer</h2>
          <dl className="mt-4 grid gap-3">
            <DetailRow label="Name" value={order.customer?.name} />
            <DetailRow label="Company" value={order.customer?.companyName} />
            <DetailRow label="Phone" value={order.customer?.phone} />
            <DetailRow label="Email" value={order.customer?.email} />
          </dl>
          {customerDetailPath ? (
            <Link className="mt-3 inline-block text-sm font-bold text-forest hover:underline" to={customerDetailPath}>
              View Customer
            </Link>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Source Quotation</h2>
          <dl className="mt-4 grid gap-3">
            <DetailRow label="Quotation Number" value={order.quotation?.quotationNumber} />
          </dl>
          {quotationDetailPath ? (
            <Link
              className="mt-3 inline-block text-sm font-bold text-forest hover:underline"
              to={quotationDetailPath}
            >
              View Quotation
            </Link>
          ) : null}
        </Card>

        {/* Captured once at order creation, never recomputed on a later
            transfer of the owning employee — same "snapshot, don't
            recompute" rule Lead's own region/district already follows. */}
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Location</h2>
          <dl className="mt-4 grid gap-3">
            <DetailRow label="Region" value={formatGeoSummary(order.region)} />
            <DetailRow label="District" value={formatGeoSummary(order.district)} />
          </dl>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Items</h2>
        <div className="mt-4">
          <OrderItemTable items={order.items || []} />
        </div>
      </Card>

      <OrderInventoryReservationSummary key={inventoryRefreshToken} order={order} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Fulfillment Status</h2>
          <div className="mt-4 space-y-3">
            {FULFILLMENT_STAGES.map((stage) => (
              <div
                className="flex items-center justify-between rounded-lg border border-forest/10 px-4 py-2 text-sm"
                key={stage.field}
              >
                <span className="font-semibold text-ink">{stage.label}</span>
                <span className={order[stage.field] ? "font-semibold text-forest" : "text-muted"}>
                  {order[stage.field] ? formatBusinessDateTime(order[stage.field]) : "Not yet"}
                </span>
              </div>
            ))}
            {order.notes ? (
              <div className="mt-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{order.notes}</p>
              </div>
            ) : null}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-black text-ink">Commercial Summary</h2>
          <div className="mt-4">
            <OrderAmountSummary order={order} />
          </div>
        </Card>
      </div>

      <OrderInvoiceSection
        existingInvoiceState={existingInvoiceState}
        invoiceDetailPathFor={invoiceDetailPathFor}
        onInvoiceCreated={onInvoiceCreated}
        order={order}
      />
    </div>
  );
}
