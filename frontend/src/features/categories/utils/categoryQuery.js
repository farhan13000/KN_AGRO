const emptyValues = new Set(["", null, undefined]);

export const cleanCategoryQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const getCategoryStatusLabel = (status, labels = {}) => labels[status] || status || "Unknown";
