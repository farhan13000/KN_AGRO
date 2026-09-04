export const INVOICE_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  CANCELLED: "CANCELLED",
});

export const INVOICE_STATUSES = Object.freeze(Object.values(INVOICE_STATUS));

export const INVOICE_STATUS_LABELS = Object.freeze({
  [INVOICE_STATUS.DRAFT]: "Draft",
  [INVOICE_STATUS.ISSUED]: "Issued",
  [INVOICE_STATUS.CANCELLED]: "Cancelled",
});

// This is Invoice's own `paymentStatus` field (phase6.md §11 calls it just
// "Payment Status", but it belongs to the Invoice model, not Payment —
// Payment's own `status` field is a completely different enum, RECORDED/
// REVERSED — see features/payments/constants). Order carries a same-named
// field too, but without OVERDUE; the two are never merged into one shared
// constant since they are genuinely different enums on different models.
export const INVOICE_PAYMENT_STATUS = Object.freeze({
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
});

export const INVOICE_PAYMENT_STATUSES = Object.freeze(Object.values(INVOICE_PAYMENT_STATUS));

export const INVOICE_PAYMENT_STATUS_LABELS = Object.freeze({
  [INVOICE_PAYMENT_STATUS.UNPAID]: "Unpaid",
  [INVOICE_PAYMENT_STATUS.PARTIALLY_PAID]: "Partially Paid",
  [INVOICE_PAYMENT_STATUS.PAID]: "Paid",
  [INVOICE_PAYMENT_STATUS.OVERDUE]: "Overdue",
});

export const DEFAULT_INVOICE_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
  paymentStatus: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});
