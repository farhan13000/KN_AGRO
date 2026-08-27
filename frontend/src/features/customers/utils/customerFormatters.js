import { formatMoney } from "../../../shared/utils/money.js";
import { CUSTOMER_STATUS_LABELS, CUSTOMER_TYPE_LABELS } from "../constants/customer.constants.js";

export const formatCustomerStatus = (status) => CUSTOMER_STATUS_LABELS[status] || status || "Unknown";

export const formatCustomerType = (type) => CUSTOMER_TYPE_LABELS[type] || type || "Unknown";

export const formatCustomerCreditLimit = (value) => formatMoney(value);

export const getCustomerDisplayName = (customer) =>
  [customer?.customerCode, customer?.name].filter(Boolean).join(" - ") || "Customer";
