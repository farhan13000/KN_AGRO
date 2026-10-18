export const PRODUCT_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DISCONTINUED: "DISCONTINUED",
});

export const PRODUCT_STATUS_LABELS = Object.freeze({
  [PRODUCT_STATUS.ACTIVE]: "Active",
  [PRODUCT_STATUS.INACTIVE]: "Inactive",
  [PRODUCT_STATUS.DISCONTINUED]: "Discontinued",
});

export const PRODUCT_UNIT = Object.freeze({
  KG: "KG",
  GRAM: "GRAM",
  TON: "TON",
  BAG: "BAG",
  PACKET: "PACKET",
  PIECE: "PIECE",
  LITRE: "LITRE",
  ML: "ML",
  BOX: "BOX",
  BOTTLE: "BOTTLE",
  OTHER: "OTHER",
});

// Selling units that ARE a pack — the only ones offered once a pack size
// is filled in. Order is how often this catalogue uses them.
export const PACK_UNITS = Object.freeze([
  PRODUCT_UNIT.BAG,
  PRODUCT_UNIT.PACKET,
  PRODUCT_UNIT.BOTTLE,
  PRODUCT_UNIT.BOX,
  PRODUCT_UNIT.PIECE,
]);

// Selling units that are a measure, not a pack — mirrors the backend's
// MEASURE_UNITS. A product sold per one of these cannot have a pack size.
export const MEASURE_UNITS = Object.freeze([
  PRODUCT_UNIT.KG,
  PRODUCT_UNIT.GRAM,
  PRODUCT_UNIT.TON,
  PRODUCT_UNIT.LITRE,
  PRODUCT_UNIT.ML,
]);

export const PRODUCT_UNIT_LABELS = Object.freeze({
  [PRODUCT_UNIT.KG]: "Kilogram",
  [PRODUCT_UNIT.GRAM]: "Gram",
  [PRODUCT_UNIT.TON]: "Ton",
  [PRODUCT_UNIT.BAG]: "Bag",
  [PRODUCT_UNIT.PACKET]: "Packet",
  [PRODUCT_UNIT.PIECE]: "Piece",
  [PRODUCT_UNIT.LITRE]: "Litre",
  [PRODUCT_UNIT.ML]: "Millilitre",
  [PRODUCT_UNIT.BOX]: "Box",
  [PRODUCT_UNIT.BOTTLE]: "Bottle",
  [PRODUCT_UNIT.OTHER]: "Other",
});

/**
 * What one pack holds ("50 Kg", "250 ml") — mirrors the backend's
 * PACK_SIZE_UNIT. Separate from PRODUCT_UNIT, which is what the product
 * is sold per and what prices are quoted against.
 */
export const PACK_SIZE_UNIT = Object.freeze({
  KG: "KG",
  GRAM: "GRAM",
  LITRE: "LITRE",
  ML: "ML",
});

export const PACK_SIZE_UNIT_LABELS = Object.freeze({
  [PACK_SIZE_UNIT.KG]: "Kg",
  [PACK_SIZE_UNIT.GRAM]: "gm",
  [PACK_SIZE_UNIT.LITRE]: "Litre",
  [PACK_SIZE_UNIT.ML]: "ml",
});

export const PRODUCT_SORT_FIELDS = Object.freeze([
  "name",
  "productCode",
  "sellingPrice",
  "createdAt",
  "updatedAt",
]);

export const DEFAULT_PRODUCT_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  category: "",
  brand: "",
  status: "",
  unit: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});
