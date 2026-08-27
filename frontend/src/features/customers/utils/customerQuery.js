const emptyValues = new Set(["", null, undefined]);

export const cleanCustomerQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const customerIdOf = (customer) => customer?._id || customer?.id || "";
