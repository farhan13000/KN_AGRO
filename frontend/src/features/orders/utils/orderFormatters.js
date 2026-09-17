import { formatMoney } from "../../../shared/utils/money.js";
import { ORDER_STATUS_LABELS } from "../constants/order.constants.js";

export const formatOrderStatus = (status) => ORDER_STATUS_LABELS[status] || status || "Unknown";

export const formatOrderAmount = (value) => formatMoney(value);

// state/district come back as plain strings (or empty) on the order — a
// snapshot of the lead's own buyer address, taken once at order creation.
export const formatGeoSummary = (value) => (value ? value : "Not Set");
