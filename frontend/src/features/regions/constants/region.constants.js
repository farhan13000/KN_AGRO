export const REGION_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
});

export const REGION_STATUS_LABELS = Object.freeze({
  [REGION_STATUS.ACTIVE]: "Active",
  [REGION_STATUS.INACTIVE]: "Inactive",
});

export const DEFAULT_REGION_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
});
