const emptyValues = new Set(["", null, undefined]);

export const cleanRegionQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const getRegionStatusLabel = (status, labels = {}) => labels[status] || status || "Unknown";
