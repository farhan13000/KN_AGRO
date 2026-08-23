const emptyValues = new Set(["", null, undefined]);

export const cleanInventoryQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));
