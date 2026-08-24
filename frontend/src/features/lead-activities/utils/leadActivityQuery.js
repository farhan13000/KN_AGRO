const emptyValues = new Set(["", null, undefined]);

export const cleanLeadActivityQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));
