const emptyValues = new Set(["", null, undefined]);

export const cleanOrderQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const orderIdOf = (order) => order?._id || order?.id || "";
