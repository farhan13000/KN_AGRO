import { PRODUCT_STATUS_LABELS, PRODUCT_UNIT_LABELS } from "../constants/index.js";
import { formatMoney } from "../../../shared/utils/index.js";

export const getProductStatusLabel = (status) => PRODUCT_STATUS_LABELS[status] || status || "Unknown";

export const getProductUnitLabel = (unit) => PRODUCT_UNIT_LABELS[unit] || unit || "Unknown";

export const getProductUnitOptions = () =>
  Object.entries(PRODUCT_UNIT_LABELS).map(([value, label]) => ({ label, value }));

export const formatProductPrice = (value) => formatMoney(value);

export const formatSpecifications = (specifications) => {
  if (!specifications || typeof specifications !== "object") return [];
  return Object.entries(specifications).filter(([, value]) => value !== null && value !== undefined && value !== "");
};
