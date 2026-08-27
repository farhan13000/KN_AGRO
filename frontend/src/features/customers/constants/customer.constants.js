export const CUSTOMER_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
});

export const CUSTOMER_STATUSES = Object.freeze(Object.values(CUSTOMER_STATUS));

export const CUSTOMER_STATUS_LABELS = Object.freeze({
  [CUSTOMER_STATUS.ACTIVE]: "Active",
  [CUSTOMER_STATUS.INACTIVE]: "Inactive",
  [CUSTOMER_STATUS.BLOCKED]: "Blocked",
});

export const CUSTOMER_TYPE = Object.freeze({
  INDIVIDUAL: "INDIVIDUAL",
  BUSINESS: "BUSINESS",
});

export const CUSTOMER_TYPES = Object.freeze(Object.values(CUSTOMER_TYPE));

export const CUSTOMER_TYPE_LABELS = Object.freeze({
  [CUSTOMER_TYPE.INDIVIDUAL]: "Individual",
  [CUSTOMER_TYPE.BUSINESS]: "Business",
});

export const DEFAULT_CUSTOMER_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
  type: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});
