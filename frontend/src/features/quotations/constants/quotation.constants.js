export const QUOTATION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CONVERTED: "CONVERTED",
  CANCELLED: "CANCELLED",
});

export const QUOTATION_STATUSES = Object.freeze(Object.values(QUOTATION_STATUS));

export const QUOTATION_STATUS_LABELS = Object.freeze({
  [QUOTATION_STATUS.DRAFT]: "Draft",
  [QUOTATION_STATUS.SENT]: "Sent",
  [QUOTATION_STATUS.ACCEPTED]: "Accepted",
  [QUOTATION_STATUS.REJECTED]: "Rejected",
  [QUOTATION_STATUS.EXPIRED]: "Expired",
  [QUOTATION_STATUS.CONVERTED]: "Converted",
  [QUOTATION_STATUS.CANCELLED]: "Cancelled",
});

export const QUOTATION_DISCOUNT_TYPE = Object.freeze({
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
});

export const QUOTATION_DISCOUNT_TYPES = Object.freeze(Object.values(QUOTATION_DISCOUNT_TYPE));

export const QUOTATION_DISCOUNT_TYPE_LABELS = Object.freeze({
  [QUOTATION_DISCOUNT_TYPE.PERCENTAGE]: "Percentage",
  [QUOTATION_DISCOUNT_TYPE.FIXED]: "Fixed Amount",
});

export const DEFAULT_QUOTATION_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
  lead: "",
  manager: "",
  employee: "",
  createdByEmployee: "",
  from: "",
  to: "",
  validFrom: "",
  validTo: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});
