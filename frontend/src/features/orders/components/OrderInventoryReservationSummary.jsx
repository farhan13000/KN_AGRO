import { useAuth } from "../../../core/auth";
import Card from "../../../shared/components/Card";
import { PERMISSIONS } from "../../../shared/constants";
import { useInventoryDetail } from "../../inventory";

const Row = ({ children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 px-4 py-3 text-sm last:border-b-0">
    {children}
  </div>
);

// Reservation state comes straight from the Order's own backend-provided
// `inventoryReserved`/`inventoryConsumed` flags — never inferred from
// Product data. This order reserved (or will reserve) exactly
// `item.quantity` units of each item at confirm time, by construction
// (order.service.js#confirmOrder), so "Reserved (this order)" is a direct
// read of the order's own frozen item snapshot, not a guess.
const reservationStateLabel = (order) => {
  if (order.inventoryConsumed) return "Consumed (dispatched)";
  if (order.inventoryReserved) return "Reserved";
  return "Not reserved yet";
};

function ItemReservationRow({ item, order }) {
  const inventoryState = useInventoryDetail(item.product);
  const inventory = inventoryState.data?.inventory;

  return (
    <Row>
      <div>
        <p className="font-black text-forest">{item.productName}</p>
        <p className="text-xs text-muted">{item.productCode}</p>
      </div>
      <span className="text-muted">Ordered: {item.quantity}</span>
      <span className="font-semibold text-ink">{reservationStateLabel(order)}</span>
      <span className="text-muted">
        {inventoryState.isLoading
          ? "Loading live stock..."
          : inventoryState.isError
            ? "Live stock unavailable"
            : `Available now: ${inventory?.availableStock ?? "Unknown"}`}
      </span>
    </Row>
  );
}

// Prompt 29 — shows backend-provided reservation values only: the order's
// own ordered quantity + reservation-state flags (frozen/authoritative for
// THIS order), cross-referenced against each item's LIVE product-wide
// Inventory.availableStock (fetched fresh per item via useInventoryDetail,
// never a stale/cached Product field). Gated on inventory.read — Employee
// doesn't hold that permission (see PHASE6_FRONTEND_API_CONTRACT.md), so
// this section simply doesn't render for them rather than firing a request
// that would 403.
export default function OrderInventoryReservationSummary({ order }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(PERMISSIONS.INVENTORY_READ)) return null;

  const items = order.items || [];
  if (!items.length) return null;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Inventory Reservation</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-forest/10">
        {items.map((item) => (
          <ItemReservationRow item={item} key={item._id || item.product} order={order} />
        ))}
      </div>
    </Card>
  );
}
