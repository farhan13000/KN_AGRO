const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

const trimOrUndefined = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
};

// Matches the backend's create-from-order body exactly — no items, no
// customer, no totals field exists to send; everything is copied from the
// Order snapshot server-side.
export const pickGenerateInvoicePayload = (values = {}) =>
  cleanPayload({
    dueDate: trimOrUndefined(values.dueDate),
  });

export const pickIssueInvoicePayload = (values = {}) =>
  cleanPayload({
    invoiceDate: trimOrUndefined(values.invoiceDate),
    dueDate: trimOrUndefined(values.dueDate),
  });

export const pickCancelInvoicePayload = (reason) =>
  cleanPayload({
    reason: trimOrUndefined(typeof reason === "string" ? reason : reason?.reason),
  });
