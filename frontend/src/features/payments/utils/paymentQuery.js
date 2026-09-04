const emptyValues = new Set(["", null, undefined]);

export const cleanPaymentQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));
