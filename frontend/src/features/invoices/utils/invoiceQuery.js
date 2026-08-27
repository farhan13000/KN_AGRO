const emptyValues = new Set(["", null, undefined]);

export const cleanInvoiceQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const invoiceIdOf = (invoice) => invoice?._id || invoice?.id || "";
