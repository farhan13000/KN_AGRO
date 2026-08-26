import { QUOTATION_DISCOUNT_TYPE } from "../constants";
import { formatQuotationAmount } from "../utils";

const AmountRow = ({ label, value, emphasis, muted }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className={muted ? "text-muted" : "text-ink"}>{label}</span>
    <span className={emphasis ? "font-black text-forest" : muted ? "text-muted" : "font-semibold text-ink"}>
      {value}
    </span>
  </div>
);

// Renders only the backend-authoritative totals returned on the quotation
// record. This component never computes anything itself — pass a locally
// previewed quotation-shaped object during builder UX if needed, but the
// saved/detail view must always pass the real backend response here.
export default function QuotationAmountSummary({ quotation, className = "" }) {
  const q = quotation || {};
  const globalDiscount = q.globalDiscount;
  const globalDiscountLabel =
    globalDiscount?.type === QUOTATION_DISCOUNT_TYPE.PERCENTAGE
      ? `Additional Discount (${globalDiscount.value}%)`
      : "Additional Discount";

  return (
    <div className={`divide-y divide-forest/10 ${className}`}>
      <AmountRow label="Subtotal" value={formatQuotationAmount(q.subtotal)} />
      {Number(q.itemDiscountTotal) > 0 && (
        <AmountRow label="Item Discounts" muted value={`- ${formatQuotationAmount(q.itemDiscountTotal)}`} />
      )}
      {Number(globalDiscount?.amount) > 0 && (
        <AmountRow label={globalDiscountLabel} muted value={`- ${formatQuotationAmount(globalDiscount.amount)}`} />
      )}
      <AmountRow label="Tax" value={formatQuotationAmount(q.taxTotal)} />
      {Number(q.shippingCharge) > 0 && (
        <AmountRow label="Shipping Charge" muted value={formatQuotationAmount(q.shippingCharge)} />
      )}
      {Number(q.otherCharges) > 0 && (
        <AmountRow label="Other Charges" muted value={formatQuotationAmount(q.otherCharges)} />
      )}
      <AmountRow emphasis label="Grand Total" value={formatQuotationAmount(q.grandTotal)} />
    </div>
  );
}
