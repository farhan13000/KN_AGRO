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
  OTHER: "OTHER",
});

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
  [PRODUCT_UNIT.OTHER]: "Other",
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
