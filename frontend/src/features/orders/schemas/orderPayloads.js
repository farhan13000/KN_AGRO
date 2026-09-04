const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

const trimOrUndefined = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
};

// Matches the backend's create-from-quotation body exactly — no items, no
// customer, no totals, no status field exists to send (they are all
// server-owned: resolved from the quotation, or computed).
export const pickCreateOrderFromQuotationPayload = (values = {}) =>
  cleanPayload({
    expectedDeliveryDate: trimOrUndefined(values.expectedDeliveryDate),
    notes: trimOrUndefined(values.notes),
  });

export const pickCancelOrderPayload = (reason) =>
  cleanPayload({
    reason: trimOrUndefined(typeof reason === "string" ? reason : reason?.reason),
  });
