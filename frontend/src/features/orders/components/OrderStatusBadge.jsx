import Badge from "../../../shared/components/Badge";
import { ORDER_STATUS } from "../constants";
import { formatOrderStatus } from "../utils";

const statusClasses = {
  [ORDER_STATUS.PENDING]: "bg-amber-50 text-amber-900 ring-amber-200",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-50 text-blue-800 ring-blue-200",
  [ORDER_STATUS.PROCESSING]: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  [ORDER_STATUS.READY]: "bg-violet-50 text-violet-800 ring-violet-200",
  [ORDER_STATUS.DISPATCHED]: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  [ORDER_STATUS.DELIVERED]: "bg-green-50 text-green-800 ring-green-200",
  [ORDER_STATUS.CANCELLED]: "bg-red-50 text-red-800 ring-red-200",
};

const badgeClass = (status) =>
  `rounded-md ring-1 ${statusClasses[status] || "bg-white text-muted ring-forest/15"}`;

// Text-first, safe-fallback (Prompt 17) — an unrecognized status still
// renders its raw value rather than throwing or rendering nothing.
export default function OrderStatusBadge({ status }) {
  return <Badge className={badgeClass(status)}>{formatOrderStatus(status)}</Badge>;
}
