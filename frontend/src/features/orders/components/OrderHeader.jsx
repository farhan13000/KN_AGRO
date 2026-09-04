import { formatBusinessDateTime } from "../../../shared/utils";
import { ORDER_STATUS } from "../constants";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderHeader({ order, roleLabel = "CRM" }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black text-ink">{order.orderNumber || "Not Set"}</h1>
        <OrderStatusBadge status={order.orderStatus} />
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        {order.customer?.name || "Unknown customer"} · Created on {formatBusinessDateTime(order.createdAt)}
        {order.expectedDeliveryDate
          ? ` · Expected delivery ${formatBusinessDateTime(order.expectedDeliveryDate)}`
          : ""}
      </p>
      {order.orderStatus === ORDER_STATUS.CANCELLED && order.cancellationReason ? (
        <p className="mt-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-800">
          Cancellation reason: {order.cancellationReason}
        </p>
      ) : null}
    </div>
  );
}
