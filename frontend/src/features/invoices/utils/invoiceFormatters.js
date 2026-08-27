import { formatMoney } from "../../../shared/utils/money.js";
import { INVOICE_PAYMENT_STATUS_LABELS, INVOICE_STATUS_LABELS } from "../constants/invoice.constants.js";

export const formatInvoiceStatus = (status) => INVOICE_STATUS_LABELS[status] || status || "Unknown";

export const formatInvoicePaymentStatus = (status) => INVOICE_PAYMENT_STATUS_LABELS[status] || status || "Unknown";

export const formatInvoiceAmount = (value) => formatMoney(value);
