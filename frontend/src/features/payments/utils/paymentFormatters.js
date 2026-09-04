import { formatMoney } from "../../../shared/utils/money.js";
import { PAYMENT_METHOD_LABELS } from "../constants/payment.constants.js";

export const formatPaymentMethod = (method) => PAYMENT_METHOD_LABELS[method] || method || "Unknown";

export const formatPaymentAmount = (value) => formatMoney(value);
