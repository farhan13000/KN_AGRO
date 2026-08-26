const emptyValues = new Set(["", null, undefined]);

export const cleanQuotationQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const quotationIdOf = (quotation) => quotation?._id || quotation?.id || "";
