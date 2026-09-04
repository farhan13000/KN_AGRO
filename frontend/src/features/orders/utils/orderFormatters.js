import { formatMoney } from "../../../shared/utils/money.js";
import { ORDER_STATUS_LABELS } from "../constants/order.constants.js";

export const formatOrderStatus = (status) => ORDER_STATUS_LABELS[status] || status || "Unknown";

export const formatOrderAmount = (value) => formatMoney(value);

// region/district come back as {_id, name, code} or null (backend
// order.serializer.js's toGeoSummary) — captured once at order creation,
// never recomputed on a later employee transfer.
export const formatGeoSummary = (geo) => (geo?.name ? geo.name : "Not Set");
