import { formatOrderAmount } from "../utils";

// Read-only, historical rendering: every cell comes from the item's own
// saved snapshot fields (productCode/productName/unit/rate/tax/...), never
// from a fresh Product lookup — a later Product/price edit can never
// change what an already-placed Order shows. Unlike Quotation items,
// Order items carry an already-computed `discountAmount` only (no raw
// discountType/discountValue survives the Quotation->Order conversion —
// confirmed in PHASE6_FRONTEND_API_CONTRACT.md), so Discount is rendered
// as a plain amount here, not a "10% (-₹X)" style breakdown.
export default function OrderItemTable({ items = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Product Code</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Discount</th>
              <th className="px-4 py-3 text-right">Tax</th>
              <th className="px-4 py-3 text-right">Line Subtotal</th>
              <th className="px-4 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {items.map((item) => (
              <tr className="align-top transition hover:bg-mint/35" key={item._id || item.product}>
                <td className="px-4 py-3 font-black text-forest">{item.productCode || "Not Set"}</td>
                <td className="px-4 py-3 font-black text-ink">{item.productName || "Unnamed Product"}</td>
                <td className="max-w-xs px-4 py-3 text-muted">{item.description || "-"}</td>
                <td className="px-4 py-3 text-muted">{item.unit || "-"}</td>
                <td className="px-4 py-3 text-right text-ink">{item.quantity ?? 0}</td>
                <td className="px-4 py-3 text-right text-ink">{formatOrderAmount(item.rate)}</td>
                <td className="px-4 py-3 text-right text-muted">{formatOrderAmount(item.discountAmount)}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {item.taxRate ? `${item.taxRate}% (${formatOrderAmount(item.taxAmount)})` : "-"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatOrderAmount(item.lineSubtotal)}
                </td>
                <td className="px-4 py-3 text-right font-black text-forest">
                  {formatOrderAmount(item.lineTotal)}
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={10}>
                  No items on this order.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
