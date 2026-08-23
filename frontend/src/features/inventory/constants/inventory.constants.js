export const INVENTORY_TRANSACTION_TYPE = Object.freeze({
  OPENING_STOCK: "OPENING_STOCK",
  STOCK_IN: "STOCK_IN",
  STOCK_OUT: "STOCK_OUT",
  ADJUSTMENT_IN: "ADJUSTMENT_IN",
  ADJUSTMENT_OUT: "ADJUSTMENT_OUT",
  DAMAGED: "DAMAGED",
  RETURN_IN: "RETURN_IN",
  RETURN_OUT: "RETURN_OUT",
  RESERVED: "RESERVED",
  RELEASED: "RELEASED",
  SALE: "SALE",
});

export const INVENTORY_TRANSACTION_TYPE_LABELS = Object.freeze({
  [INVENTORY_TRANSACTION_TYPE.OPENING_STOCK]: "Opening Stock",
  [INVENTORY_TRANSACTION_TYPE.STOCK_IN]: "Stock In",
  [INVENTORY_TRANSACTION_TYPE.STOCK_OUT]: "Stock Out",
  [INVENTORY_TRANSACTION_TYPE.ADJUSTMENT_IN]: "Adjustment In",
  [INVENTORY_TRANSACTION_TYPE.ADJUSTMENT_OUT]: "Adjustment Out",
  [INVENTORY_TRANSACTION_TYPE.DAMAGED]: "Damaged",
  [INVENTORY_TRANSACTION_TYPE.RETURN_IN]: "Return In",
  [INVENTORY_TRANSACTION_TYPE.RETURN_OUT]: "Return Out",
  [INVENTORY_TRANSACTION_TYPE.RESERVED]: "Reserved",
  [INVENTORY_TRANSACTION_TYPE.RELEASED]: "Released",
  [INVENTORY_TRANSACTION_TYPE.SALE]: "Sale",
});

export const STOCK_STATUS = Object.freeze({
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
});

export const STOCK_STATUS_LABELS = Object.freeze({
  [STOCK_STATUS.IN_STOCK]: "In Stock",
  [STOCK_STATUS.LOW_STOCK]: "Low Stock",
  [STOCK_STATUS.OUT_OF_STOCK]: "Out of Stock",
});

export const INVENTORY_ADJUSTMENT_TYPE = Object.freeze({
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
});

export const INVENTORY_SORT_FIELDS = Object.freeze([
  "currentStock",
  "availableStock",
  "reservedStock",
  "minimumStock",
  "productCode",
  "name",
]);

export const DEFAULT_INVENTORY_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  category: "",
  productStatus: "",
  lowStock: "",
  outOfStock: "",
  sortBy: "name",
  sortOrder: "asc",
});

export const DEFAULT_TRANSACTION_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  type: "",
  from: "",
  to: "",
  performedBy: "",
  product: "",
  category: "",
  search: "",
  sortOrder: "desc",
});
