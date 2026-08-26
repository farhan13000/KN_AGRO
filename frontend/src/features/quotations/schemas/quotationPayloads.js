import { QUOTATION_DISCOUNT_TYPES } from "../constants/quotation.constants.js";

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

const trimOrUndefined = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
};

const numberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
};

const productIdOf = (product) =>
  typeof product === "string" ? product : product?._id || product?.id || "";

const pickQuotationItemPayload = (item) => {
  const productId = trimOrUndefined(productIdOf(item?.product ?? item?.productId));
  if (!productId) return null;

  const hasDiscountType = QUOTATION_DISCOUNT_TYPES.includes(item?.discountType);

  return cleanPayload({
    productId,
    quantity: numberOrUndefined(item.quantity),
    rate: numberOrUndefined(item.rate),
    discountType: hasDiscountType ? item.discountType : undefined,
    discountValue: hasDiscountType ? numberOrUndefined(item.discountValue) ?? 0 : undefined,
    taxRate: numberOrUndefined(item.taxRate),
    description: trimOrUndefined(item.description),
  });
};

const pickQuotationItemsPayload = (items) => {
  if (!Array.isArray(items)) return undefined;
  const picked = items.map(pickQuotationItemPayload).filter(Boolean);
  return picked.length ? picked : undefined;
};

const pickGlobalDiscountPayload = (discount) => {
  if (!discount || !QUOTATION_DISCOUNT_TYPES.includes(discount.type)) return undefined;
  const value = numberOrUndefined(discount.value);
  if (value === undefined) return undefined;
  return { type: discount.type, value };
};

// Shared by create and update — matches the backend's editable-field
// whitelist exactly (quotation.validation.js#quotationEditableFieldsShape).
// Never spread a raw form object into a mutation: every server-owned field
// (quotationNumber, status, totals, timestamps) is simply absent here.
const pickQuotationEditableFields = (values) =>
  cleanPayload({
    items: pickQuotationItemsPayload(values.items),
    globalDiscount: pickGlobalDiscountPayload(values.globalDiscount),
    shippingCharge: numberOrUndefined(values.shippingCharge),
    otherCharges: numberOrUndefined(values.otherCharges),
    validFrom: trimOrUndefined(values.validFrom),
    validUntil: trimOrUndefined(values.validUntil),
    termsAndConditions: trimOrUndefined(values.termsAndConditions),
    notes: trimOrUndefined(values.notes),
  });

export const pickCreateQuotationPayload = (values) =>
  cleanPayload({
    leadId: trimOrUndefined(values.leadId || productIdOf(values.lead)),
    ...pickQuotationEditableFields(values),
  });

export const pickUpdateQuotationPayload = (values) => pickQuotationEditableFields(values);

export const pickRejectQuotationPayload = (reason) =>
  cleanPayload({
    reason: trimOrUndefined(typeof reason === "string" ? reason : reason?.reason),
  });

export const pickCancelQuotationPayload = (reason) =>
  cleanPayload({
    reason: trimOrUndefined(typeof reason === "string" ? reason : reason?.reason),
  });
