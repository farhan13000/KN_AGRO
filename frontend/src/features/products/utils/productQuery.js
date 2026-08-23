const emptyValues = new Set(["", null, undefined]);

export const cleanProductQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));
