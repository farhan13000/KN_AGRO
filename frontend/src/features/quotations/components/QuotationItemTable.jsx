import { formatQuotationAmount, formatQuotationItemDiscount } from "../utils";

// Read-only, historical rendering: every cell comes from the item's own
// saved snapshot fields (productCode/productName/unit/rate/tax/...), never
// from a fresh Product lookup, so a later Product edit can never change
// what an old quotation shows.
export default function QuotationItemTable({ items = [] }) {
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
                <td className="px-4 py-3 text-right text-ink">{formatQuotationAmount(item.rate)}</td>
                <td className="px-4 py-3 text-right text-muted">{formatQuotationItemDiscount(item)}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {item.taxRate ? `${item.taxRate}% (${formatQuotationAmount(item.taxAmount)})` : "-"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatQuotationAmount(item.lineSubtotal)}
                </td>
                <td className="px-4 py-3 text-right font-black text-forest">
                  {formatQuotationAmount(item.lineTotal)}
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={10}>
                  No items on this quotation.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
