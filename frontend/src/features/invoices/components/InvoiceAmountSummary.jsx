import { formatInvoiceAmount } from "../utils";

const AmountRow = ({ label, value, emphasis, muted }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className={muted ? "text-muted" : "text-ink"}>{label}</span>
    <span className={emphasis ? "font-black text-forest" : muted ? "text-muted" : "font-semibold text-ink"}>
      {value}
    </span>
  </div>
);

// Renders only the backend-authoritative totals on the invoice record —
// copied directly from the source Order at generation time and frozen;
// "do not allow totals to change after issue" is enforced by the backend
// having nothing for a client to change them with, not recomputed here.
export default function InvoiceAmountSummary({ invoice, className = "" }) {
  const i = invoice || {};

  return (
    <div className={`divide-y divide-forest/10 ${className}`}>
      <AmountRow label="Subtotal" value={formatInvoiceAmount(i.subtotal)} />
      {Number(i.discountTotal) > 0 && (
        <AmountRow label="Discount" muted value={`- ${formatInvoiceAmount(i.discountTotal)}`} />
      )}
      <AmountRow label="Tax" value={formatInvoiceAmount(i.taxTotal)} />
      {Number(i.shippingCharge) > 0 && (
        <AmountRow label="Shipping Charge" muted value={formatInvoiceAmount(i.shippingCharge)} />
      )}
      {Number(i.otherCharges) > 0 && (
        <AmountRow label="Other Charges" muted value={formatInvoiceAmount(i.otherCharges)} />
      )}
      <AmountRow emphasis label="Grand Total" value={formatInvoiceAmount(i.grandTotal)} />
    </div>
  );
}
