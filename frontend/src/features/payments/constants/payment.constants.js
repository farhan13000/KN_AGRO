// Payment.method — the actual field this module owns. Not to be confused
// with Invoice.paymentStatus (UNPAID/PARTIALLY_PAID/PAID/OVERDUE, a
// completely different field on a different model — see
// features/invoices/constants). No gateway-specific methods exist or will
// ever be added — manual/offline recording only (phase6.md §13).
export const PAYMENT_METHOD = Object.freeze({
  CASH: "CASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  UPI: "UPI",
  CHEQUE: "CHEQUE",
  CARD: "CARD",
  OTHER: "OTHER",
});

export const PAYMENT_METHODS = Object.freeze(Object.values(PAYMENT_METHOD));

export const PAYMENT_METHOD_LABELS = Object.freeze({
  [PAYMENT_METHOD.CASH]: "Cash",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Bank Transfer",
  [PAYMENT_METHOD.UPI]: "UPI",
  [PAYMENT_METHOD.CHEQUE]: "Cheque",
  [PAYMENT_METHOD.CARD]: "Card",
  [PAYMENT_METHOD.OTHER]: "Other",
});

export const DEFAULT_PAYMENT_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  method: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});
