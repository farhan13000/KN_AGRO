import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import AddressDisplay from "../../../shared/components/AddressDisplay";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { formatBusinessDateTime } from "../../../shared/utils";
import CustomerHistoryPanel from "./CustomerHistoryPanel";
import CustomerStatusBadge from "./CustomerStatusBadge";
import { formatCustomerCreditLimit, formatCustomerType, getCustomerCapabilities } from "../utils";

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value || "Not Set"}</dd>
  </div>
);

// Purely presentational — `customer` and `historyState` are both owned and
// fetched by CustomerDetailRouteView, matching the exact
// QuotationDetailView/QuotationDetailRouteView split. `historyState` is
// intentionally NOT part of the page's own loading gate — it renders on
// its own timeline inside CustomerHistoryPanel, so Identity/Contact/
// Address are visible immediately even while Activity is still loading.
export default function CustomerDetailView({ customer, editPath = "", historyState, leadDetailPath, roleLabel = "CRM" }) {
  const { hasPermission } = useAuth();
  const sourceLead = historyState?.data?.leads?.latest?.[0];
  const { canEditCustomer: canEditCustomerPermission } = getCustomerCapabilities({ hasPermission });
  const canEditCustomer = canEditCustomerPermission && Boolean(editPath);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-ink">{customer.name || "Customer Detail"}</h1>
            <CustomerStatusBadge status={customer.status} />
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {customer.customerCode || "Pending code"} · {formatCustomerType(customer.type)}
          </p>
        </div>
        {canEditCustomer ? (
          <Button className="shrink-0" to={editPath} variant="secondary">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Identity &amp; Contact</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailRow label="Customer Code" value={customer.customerCode} />
          <DetailRow label="Company" value={customer.companyName} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Location" value={customer.location} />
          <DetailRow label="Created" value={formatBusinessDateTime(customer.createdAt)} />
        </dl>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <AddressDisplay address={customer.billingAddress} label="Billing Address" />
        <AddressDisplay address={customer.shippingAddress} label="Shipping Address" />
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Tax Information &amp; Payment Terms</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailRow label="GST Number" value={customer.GSTNumber} />
          <DetailRow label="PAN Number" value={customer.PANNumber} />
          <DetailRow label="Credit Limit" value={formatCustomerCreditLimit(customer.creditLimit)} />
          <DetailRow label="Payment Terms" value={customer.paymentTerms} />
        </dl>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Source Lead</h2>
        {sourceLead ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forest/10 bg-mint/40 px-4 py-3">
            <div>
              <p className="text-sm font-black text-ink">{sourceLead.name}</p>
              <p className="mt-1 text-xs font-semibold text-muted">
                {[sourceLead.leadCode, sourceLead.status].filter(Boolean).join(" · ")}
              </p>
            </div>
            {leadDetailPath ? (
              <Link className="text-sm font-bold text-forest hover:underline" to={leadDetailPath(sourceLead)}>
                View Lead
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            {historyState?.isLoading
              ? "Loading..."
              : "No source lead on record, or it is outside your allowed scope."}
          </p>
        )}
      </Card>

      <CustomerHistoryPanel historyState={historyState} />
    </div>
  );
}
