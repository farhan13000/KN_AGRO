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

const numberOrUndefined = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Direct order — taken against a lead with no quotation behind it.
 *
 * Only product ids, quantities and the two optional overrides go up.
 * productCode/productName/unit and EVERY total are resolved and computed
 * by the backend (see createDirectOrderSchema / resolveDirectOrderItems),
 * so there is deliberately no field here for a price total to travel in.
 * `rate` is an override of the product's own price.
 *
 * A discount travels as its two inputs (type + value), exactly like a
 * quotation item's; the server turns them into the stored discount
 * amount. Sent only for a line that has one.
 */
export const pickCreateDirectOrderPayload = (values = {}) =>
  cleanPayload({
    leadId: values.leadId,
    items: (values.items || []).map((item) =>
      cleanPayload({
        productId: item.product?._id || item.productId,
        quantity: Number(item.quantity),
        rate: numberOrUndefined(item.rate),
        taxRate: numberOrUndefined(item.taxRate),
        discountType: item.discountType || undefined,
        discountValue: item.discountType ? numberOrUndefined(item.discountValue) : undefined,
        description: trimOrUndefined(item.description),
      }),
    ),
    shippingCharge: numberOrUndefined(values.shippingCharge),
    otherCharges: numberOrUndefined(values.otherCharges),
    expectedDeliveryDate: trimOrUndefined(values.expectedDeliveryDate),
    notes: trimOrUndefined(values.notes),
  });
