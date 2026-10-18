import { PACK_SIZE_UNIT_LABELS, PRODUCT_STATUS_LABELS, PRODUCT_UNIT_LABELS } from "../constants/index.js";
import { formatMoney } from "../../../shared/utils/index.js";

/** "50 Kg", or "Not Set" for a product nobody has given a pack size. */
export const formatPackSize = (packSize) => {
  if (packSize?.value === null || packSize?.value === undefined || !packSize?.unit) return "Not Set";
  return `${packSize.value} ${PACK_SIZE_UNIT_LABELS[packSize.unit] || packSize.unit}`;
};

// A large total reads better in the bigger unit: 20 × 500 ml is "10
// Litre", not "10000 ml".
const LARGER_PACK_UNIT = { GRAM: ["KG", 1000], ML: ["LITRE", 1000] };

// Up to 3 decimals, so 3 × 0.1 Kg prints "0.3", not "0.30000000000000004".
const formatPackNumber = (value) => Number(value).toLocaleString("en-IN", { maximumFractionDigits: 3 });

/**
 * The pack-size note under a document line's quantity: "50 Kg each ·
 * 100 Kg total" for 2 bags. Null when the line has no pack size — every
 * line created before pack size existed — so it shows nothing at all.
 * The total is left off for a quantity of 1, where it would only repeat
 * the pack size.
 */
export const describeLinePackSizeParts = (packSize, quantity) => {
  if (packSize?.value === null || packSize?.value === undefined || !packSize?.unit) return null;

  const label = (unit) => PACK_SIZE_UNIT_LABELS[unit] || unit;
  const each = `${formatPackNumber(packSize.value)} ${label(packSize.unit)} each`;

  const count = Number(quantity);
  if (!Number.isFinite(count) || count <= 0 || count === 1) return { each, total: null };

  let total = count * packSize.value;
  let totalUnit = packSize.unit;
  const larger = LARGER_PACK_UNIT[packSize.unit];
  if (larger && total >= larger[1]) {
    total /= larger[1];
    [totalUnit] = larger;
  }
  return { each, total: `${formatPackNumber(total)} ${label(totalUnit)} total` };
};

/** The same note as one line, for places with no room for two. */
export const describeLinePackSize = (packSize, quantity) => {
  const parts = describeLinePackSizeParts(packSize, quantity);
  if (!parts) return null;
  return parts.total ? `${parts.each} · ${parts.total}` : parts.each;
};

// For prices that may be unset (MRP, a buyer tier). formatMoney alone
// would turn null into "₹0", which reads as "free" rather than "not set".
export const formatOptionalPrice = (value) =>
  value === null || value === undefined || value === "" ? "Not Set" : formatMoney(value);

export const getProductStatusLabel = (status) => PRODUCT_STATUS_LABELS[status] || status || "Unknown";

export const getProductUnitLabel = (unit) => PRODUCT_UNIT_LABELS[unit] || unit || "Unknown";

export const getProductUnitOptions = () =>
  Object.entries(PRODUCT_UNIT_LABELS).map(([value, label]) => ({ label, value }));

export const formatProductPrice = (value) => formatMoney(value);

export const formatSpecifications = (specifications) => {
  if (!specifications || typeof specifications !== "object") return [];
  return Object.entries(specifications).filter(([, value]) => value !== null && value !== undefined && value !== "");
};
