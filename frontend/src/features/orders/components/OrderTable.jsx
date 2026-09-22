import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, rowActionClass } from "../../../shared/components";
import { formatBusinessDateTime } from "../../../shared/utils";
import { ORDER_STATUS } from "../constants";
import { formatGeoSummary, formatOrderAmount } from "../utils";
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
  const columns = [
    {
      key: "orderNumber",
      header: "Order Number",
      role: "title",
      cellClassName: "font-black text-forest",
      cell: (order) => order.orderNumber,
    },
    {
      key: "customer",
      header: "Customer",
      cellClassName: "text-ink",
      cell: (order) => order.customer?.name || "Not Set",
    },
    {
      key: "quotation",
      header: "Quotation",
      cellClassName: "text-muted",
      cell: (order) => order.quotation?.quotationNumber || "Not Set",
    },
    {
      key: "state",
      header: "State",
      cellClassName: "text-muted",
      cell: (order) => formatGeoSummary(order.state),
    },
    {
      key: "district",
      header: "District",
      cellClassName: "text-muted",
      cell: (order) => formatGeoSummary(order.district),
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (order) => <OrderStatusBadge status={order.orderStatus} />,
    },
    {
      key: "grandTotal",
      header: "Order Value",
      align: "right",
      cellClassName: "font-bold text-ink",
      cell: (order) => formatOrderAmount(order.grandTotal),
    },
    {
      key: "createdAt",
      header: "Created At",
      cellClassName: "text-muted",
      cell: (order) => formatBusinessDateTime(order.createdAt),
    },
    {
      key: "dispatchState",
      header: "Dispatch State",
      cellClassName: "text-muted",
      cell: dispatchStateLabel,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (order) => (
        <div className="flex justify-end">
          <Link aria-label={`View ${order.orderNumber}`} className={rowActionClass} to={detailPath(order)}>
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="1060px" rows={orders} />;
}
