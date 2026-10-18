import DocumentLetterhead from "../../../shared/components/DocumentLetterhead";
import PrintWatermark from "../../../shared/components/PrintWatermark";
import LinePackSize from "../../products/components/LinePackSize";
import { formatBusinessDateTime, formatDocumentMoney } from "../../../shared/utils";
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
    <div className="relative mx-auto max-w-3xl bg-white p-4 text-ink sm:p-8 print:max-w-none print:p-0" data-print-sheet>
      <PrintWatermark />
      <div className="relative">
      <DocumentLetterhead
        company={order.company}
        documentNumber={order.orderNumber}
        meta={[
          { label: "Date", value: formatBusinessDateTime(order.createdAt) },
          ...(order.expectedDeliveryDate
            ? [{ label: "Expected Delivery", value: formatBusinessDateTime(order.expectedDeliveryDate) }]
            : []),
        ]}
        status={<OrderStatusBadge status={order.orderStatus} />}
        title="Order"
      />

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Customer</p>
        <p className="mt-1 text-sm font-bold text-ink">{order.customer?.name || "Not Set"}</p>
        {order.customer?.companyName ? <p className="text-sm text-muted">{order.customer.companyName}</p> : null}
        <p className="text-sm text-muted">
          {[order.customer?.phone, order.customer?.email].filter(Boolean).join(" · ") || "Not Set"}
        </p>
      </div>

      {/* `doc-items` (index.css) caps Description and keeps every amount
          on one line, so a long description cannot squeeze the numbers. */}
      <table className="doc-table doc-items mt-6 w-full border-collapse text-sm">
        <colgroup>
          <col className="doc-col-product" />
          <col className="doc-col-desc" />
          <col span={5} />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-ink/80 text-left text-xs font-black uppercase">
            <th className="py-2 pr-2">Product</th>
            <th className="py-2 pr-2">Description</th>
            <th className="doc-num py-2 pr-2 text-right">Qty</th>
            <th className="doc-num py-2 pr-2 text-right">Rate</th>
            <th className="doc-num py-2 pr-2 text-right">Discount</th>
            <th className="doc-num py-2 pr-2 text-right">Tax</th>
            <th className="doc-num py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, index) => (
            <tr className="border-b border-forest/15 align-top" key={`${item.productCode}-${index}`}>
              <td className="doc-cell-title py-2 pr-2">
                <p className="font-bold">{item.productName || "Unnamed Product"}</p>
                <p className="text-xs text-muted">{item.productCode}</p>
              </td>
              <td className="doc-desc py-2 pr-2 text-muted">
                <span className="doc-label">Description</span>
                {item.description || "-"}
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Qty</span>
                {/* One wrapper, so the pack-size lines stack under the
                    quantity in the phone card layout too. */}
                <span>
                  {item.quantity} {item.unit}
                  <LinePackSize packSize={item.packSize} quantity={item.quantity} />
                </span>
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Rate</span>
                {formatDocumentMoney(item.rate)}
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Discount</span>
                {formatDocumentMoney(item.discountAmount)}
              </td>
              <td className="doc-num py-2 pr-2 text-right">
                <span className="doc-label">Tax</span>
                {item.taxRate ? `${item.taxRate}%` : "-"}
              </td>
              <td className="doc-num py-2 text-right font-bold">
                <span className="doc-label">Total</span>
                {formatDocumentMoney(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs divide-y divide-forest/10">
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Subtotal</span>
            <span>{formatDocumentMoney(order.subtotal)}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Discount</span>
              <span>- {formatDocumentMoney(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span>Tax</span>
            <span>{formatDocumentMoney(order.taxTotal)}</span>
          </div>
          {Number(order.shippingCharge) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Shipping Charge</span>
              <span>{formatDocumentMoney(order.shippingCharge)}</span>
            </div>
          )}
          {Number(order.otherCharges) > 0 && (
            <div className="flex items-center justify-between py-1.5 text-sm text-muted">
              <span>Other Charges</span>
              <span>{formatDocumentMoney(order.otherCharges)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 text-base font-black">
            <span>Grand Total</span>
            <span>{formatDocumentMoney(order.grandTotal)}</span>
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
    </div>
  );
}
