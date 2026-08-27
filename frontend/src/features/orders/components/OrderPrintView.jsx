import { formatBusinessDateTime } from "../../../shared/utils";
import { formatOrderAmount } from "../utils";
import OrderStatusBadge from "./OrderStatusBadge";

// Prompt 54: unlike Quotations/Invoices, there is no dedicated
// `GET /orders/:id/print` endpoint on the backend (confirmed by reading
// order.routes.js directly — no print route exists at all) and no company
// letterhead data reachable from the frontend either. Rather than invent
// either, this reuses the same admin detail data already fetched by
// useOrderDetail (all of it real, historical item snapshots) and renders
// it in a clean, letterhead-free print layout — no fabricated company
// block.
export default function OrderPrintView({ order }) {
  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink print:max-w-none print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink/80 pb-6">
        <div>
          <h1 className="text-2xl font-black">KN Agro</h1>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-wide">Order</h2>
          <p className="mt-1 text-sm font-bold">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-muted">Date: {formatBusinessDateTime(order.createdAt)}</p>
          {order.expectedDeliveryDate ? (
            <p className="mt-1 text-xs text-muted">
              Expected Delivery: {formatBusinessDateTime(order.expectedDeliveryDate)}
            </p>
          ) : null}
          <div className="mt-2 flex justify-end">
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Customer</p>
        <p className="mt-1 text-sm font-bold text-ink">{order.customer?.name || "Not Set"}</p>
        {order.customer?.companyName ? <p className="text-sm text-muted">{order.customer.companyName}</p> : null}
        <p className="text-sm text-muted">
          {[order.customer?.phone, order.customer?.email].filter(Boolean).join(" · ") || "Not Set"}
        </p>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink/80 text-left text-xs font-black uppercase">
            <th className="py-2 pr-2">Product</th>
            <th className="py-2 pr-2">Description</th>
            <th className="py-2 pr-2 text-right">Qty</th>
            <th className="py-2 pr-2 text-right">Rate</th>
            <th className="py-2 pr-2 text-right">Discount</th>
            <th className="py-2 pr-2 text-right">Tax</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, index) => (
            <tr className="border-b border-forest/15 align-top" key={`${item.productCode}-${index}`}>
              <td className="py-2 pr-2">
                <p className="font-bold">{item.productName || "Unnamed Product"}</p>
                <p className="text-xs text-muted">{item.productCode}</p>
              </td>
              <td className="py-2 pr-2 text-muted">{item.description || "-"}</td>
              <td className="py-2 pr-2 text-right">
                {item.quantity} {item.unit}
              </td>
              <td className="py-2 pr-2 text-right">{formatOrderAmount(item.rate)}</td>
              <td className="py-2 pr-2 text-right">{formatOrderAmount(item.discountAmount)}</td>
              <td className="py-2 pr-2 text-right">{item.taxRate ? `${item.taxRate}%` : "-"}</td>
              <td className="py-2 text-right font-bold">{formatOrderAmount(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs divide-y divide-forest/10">
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Subtotal</span>
            <span>{formatOrderAmount(order.subtotal)}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Discount</span>
              <span>- {formatOrderAmount(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Tax</span>
            <span>{formatOrderAmount(order.taxTotal)}</span>
          </div>
          {Number(order.shippingCharge) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Shipping Charge</span>
              <span>{formatOrderAmount(order.shippingCharge)}</span>
            </div>
          )}
          {Number(order.otherCharges) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Other Charges</span>
              <span>{formatOrderAmount(order.otherCharges)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 text-base font-black">
            <span>Grand Total</span>
            <span>{formatOrderAmount(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {order.notes ? (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{order.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
