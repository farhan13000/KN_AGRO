import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBusinessDateTime } from "../../../shared/utils";
import { ORDER_STATUS } from "../constants";
import { formatOrderAmount } from "../utils";
import OrderStatusBadge from "./OrderStatusBadge";

// "Dispatch State" is derived only from backend-provided fields
// (dispatchedAt/orderStatus) — never a separate invented field. It exists
// alongside the Status column because Status alone doesn't distinguish
// "READY, about to be dispatched" from "PENDING, nowhere close" at a
// glance in a dense list.
const dispatchStateLabel = (order) => {
  if (order.dispatchedAt) return `Dispatched ${formatBusinessDateTime(order.dispatchedAt)}`;
  if (order.orderStatus === ORDER_STATUS.READY) return "Ready for dispatch";
  if (order.orderStatus === ORDER_STATUS.CANCELLED) return "Not applicable";
  return "Not yet dispatched";
};

export default function OrderTable({ detailPath, orders = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Quotation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Order Value</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Dispatch State</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {orders.map((order) => (
              <tr className="align-top transition hover:bg-mint/35" key={order._id}>
                <td className="px-4 py-3 font-black text-forest">{order.orderNumber}</td>
                <td className="px-4 py-3 text-ink">{order.customer?.name || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{order.quotation?.quotationNumber || "Not Set"}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.orderStatus} />
                </td>
                <td className="px-4 py-3 text-right font-bold text-ink">{formatOrderAmount(order.grandTotal)}</td>
                <td className="px-4 py-3 text-muted">{formatBusinessDateTime(order.createdAt)}</td>
                <td className="px-4 py-3 text-muted">{dispatchStateLabel(order)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${order.orderNumber}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={detailPath(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
