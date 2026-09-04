import { formatMoney } from "../../../shared/utils/money.js";
import { ORDER_STATUS_LABELS } from "../constants/order.constants.js";

export const formatOrderStatus = (status) => ORDER_STATUS_LABELS[status] || status || "Unknown";

export const formatOrderAmount = (value) => formatMoney(value);
