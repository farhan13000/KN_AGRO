// Matches phase6.md §3 exactly — deliberately excludes the raw model's
// `DRAFT` enum value. Confirmed by backend audit: the only order-creation
// path (createOrderFromQuotation) always sets orderStatus: "PENDING"
// directly, so DRAFT is unreachable dead code on the backend itself: no
// need to build UI for a status nothing can ever actually be in.
export const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  DISPATCHED: "DISPATCHED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
});

export const ORDER_STATUSES = Object.freeze(Object.values(ORDER_STATUS));

export const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.READY]: "Ready",
  [ORDER_STATUS.DISPATCHED]: "Dispatched",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
});

// Note: the list query filter field is `orderStatus`, not `status` — the
// Order model's own status field is literally named `orderStatus`
// (order.model.js), and the list validation schema matches that exactly.
export const DEFAULT_ORDER_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  orderStatus: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});

// Prompt 41: mirrors the backend's own INVOICE_ELIGIBLE_ORDER_STATUSES
// (invoice.constants.js), which is itself just an alias for
// ORDER_BOOKED_STATUSES (order.constants.js on the backend) — verified
// directly against both files rather than assumed. "Generate Invoice"
// must only ever be offered when the order's own status is one of these;
// PENDING (not yet confirmed/no reservation) and CANCELLED are never
// eligible.
export const INVOICE_ELIGIBLE_ORDER_STATUSES = Object.freeze([
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.READY,
  ORDER_STATUS.DISPATCHED,
  ORDER_STATUS.DELIVERED,
]);
