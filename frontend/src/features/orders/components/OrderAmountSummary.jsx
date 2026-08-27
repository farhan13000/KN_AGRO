import { formatOrderAmount } from "../utils";

const AmountRow = ({ label, value, emphasis, muted }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className={muted ? "text-muted" : "text-ink"}>{label}</span>
    <span className={emphasis ? "font-black text-forest" : muted ? "text-muted" : "font-semibold text-ink"}>
      {value}
    </span>
  </div>
);

// Renders only the backend-authoritative totals on the order record — all
// copied directly from the source Quotation at creation time, never
// recomputed on this side (PHASE6_FRONTEND_API_CONTRACT.md).
export default function OrderAmountSummary({ order, className = "" }) {
  const o = order || {};

  return (
    <div className={`divide-y divide-forest/10 ${className}`}>
      <AmountRow label="Subtotal" value={formatOrderAmount(o.subtotal)} />
      {Number(o.discountTotal) > 0 && (
        <AmountRow label="Discount" muted value={`- ${formatOrderAmount(o.discountTotal)}`} />
      )}
      <AmountRow label="Tax" value={formatOrderAmount(o.taxTotal)} />
      {Number(o.shippingCharge) > 0 && (
        <AmountRow label="Shipping Charge" muted value={formatOrderAmount(o.shippingCharge)} />
      )}
      {Number(o.otherCharges) > 0 && (
        <AmountRow label="Other Charges" muted value={formatOrderAmount(o.otherCharges)} />
      )}
      <AmountRow emphasis label="Grand Total" value={formatOrderAmount(o.grandTotal)} />
    </div>
  );
}
