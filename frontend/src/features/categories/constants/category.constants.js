export const CATEGORY_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
});

export const CATEGORY_STATUS_LABELS = Object.freeze({
  [CATEGORY_STATUS.ACTIVE]: "Active",
  [CATEGORY_STATUS.INACTIVE]: "Inactive",
});

export const CATEGORY_SORT_FIELDS = Object.freeze(["name", "sortOrder", "createdAt", "updatedAt"]);

export const DEFAULT_CATEGORY_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
  sortBy: "sortOrder",
  order: "asc",
});
