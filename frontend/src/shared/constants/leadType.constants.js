/**
 * What kind of buyer a lead is — mirrors the backend's
 * constants/leadTypes.js, which is the authority.
 *
 * One fact with two consequences, which is why it is shared rather than
 * living inside the leads feature: a lead carries it, and a product
 * carries one price per value of it.
 */
export const LEAD_TYPE = Object.freeze({
  SUPER_STOCK: "SUPER_STOCK",
  DISTRIBUTOR: "DISTRIBUTOR",
  DEALER: "DEALER",
});

export const LEAD_TYPES = Object.freeze(Object.values(LEAD_TYPE));

export const LEAD_TYPE_LABELS = Object.freeze({
  [LEAD_TYPE.SUPER_STOCK]: "Super Stock (SS)",
  [LEAD_TYPE.DISTRIBUTOR]: "Distributor",
  [LEAD_TYPE.DEALER]: "Dealer",
});

// Dealer is the dearest of the three, so a lead nobody typed a type for
// is quoted at full price rather than given a wholesaler's discount by
// accident. Same reasoning, and same value, as the backend's default.
export const DEFAULT_LEAD_TYPE = LEAD_TYPE.DEALER;

export const LEAD_TYPE_OPTIONS = Object.freeze(
  LEAD_TYPES.map((value) => ({ value, label: LEAD_TYPE_LABELS[value] }))
);

export const getLeadTypeLabel = (leadType) => LEAD_TYPE_LABELS[leadType] || "Not set";

/**
 * What a product costs a given kind of buyer — the client-side twin of
 * the backend's priceForLeadType, reading the same `leadTypePrices`
 * shape off a serialized product. A tier nobody has priced falls back to
 * the standard selling price, which is what keeps every existing product
 * working untouched.
 */
export const priceForLeadType = (product, leadType = DEFAULT_LEAD_TYPE) => {
  const tierPrice = product?.leadTypePrices?.[leadType];
  if (tierPrice !== null && tierPrice !== undefined && tierPrice !== "") return Number(tierPrice);
  return Number(product?.sellingPrice ?? 0);
};
