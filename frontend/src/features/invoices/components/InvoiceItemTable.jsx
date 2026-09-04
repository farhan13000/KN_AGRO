import { formatInvoiceAmount } from "../utils";

// Prompt 40: read-only, historical rendering only — every cell comes from
// the item's own saved snapshot fields, never a fresh Product or Order
// lookup. Same shape as OrderItemTable (Invoice items are copied straight
// from the source Order's own already-frozen items — see
// invoice.model.js's own comment that Invoice items are "identical shape
// to orderItemSchema... should copy Order snapshots, do not recalculate
// using current Product catalog").
export default function InvoiceItemTable({ items = [] }) {
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
                <td className="px-4 py-3 text-right text-ink">{formatInvoiceAmount(item.rate)}</td>
                <td className="px-4 py-3 text-right text-muted">{formatInvoiceAmount(item.discountAmount)}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {item.taxRate ? `${item.taxRate}% (${formatInvoiceAmount(item.taxAmount)})` : "-"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatInvoiceAmount(item.lineSubtotal)}
                </td>
                <td className="px-4 py-3 text-right font-black text-forest">
                  {formatInvoiceAmount(item.lineTotal)}
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={10}>
                  No items on this invoice.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
