const emptyValues = new Set(["", null, undefined]);

export const cleanLeadQuery = (query = {}) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => !emptyValues.has(value)));

export const leadIdOf = (lead) => lead?._id || lead?.id || "";

export const getLeadDisplayName = (lead) =>
  [lead?.leadCode, lead?.name].filter(Boolean).join(" - ") || "Lead";
