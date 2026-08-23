import { INVENTORY_TRANSACTION_TYPE_LABELS, STOCK_STATUS, STOCK_STATUS_LABELS } from "../constants/index.js";

export const getInventoryTransactionTypeLabel = (type) =>
  INVENTORY_TRANSACTION_TYPE_LABELS[type] || type || "Unknown";

export const getStockStatusLabel = (status) => STOCK_STATUS_LABELS[status] || status || "Unknown";

export const deriveStockStatus = ({ availableStock = 0, minimumStock = 0 } = {}) => {
  const available = Number(availableStock) || 0;
  const minimum = Number(minimumStock) || 0;

  if (available <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (available <= minimum) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
};
