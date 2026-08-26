import { QUOTATION_DISCOUNT_TYPE } from "../constants/quotation.constants.js";

/**
 * PREVIEW ONLY — mirrors backend/src/modules/quotations/quotation.calculator.js
 * exactly (same formula, same paise-level rounding via backend/src/utils/money.js)
 * so the builder's live preview matches what the server will actually compute.
 * The saved/displayed quotation must always use the backend response, never
 * this output — see QuotationAmountSummary's own doc comment.
 *
 * Rupees in, rupees out; paise only exists inside this file, to match the
 * backend's own rounding granularity instead of rounding at 2-decimal-rupee
 * precision (which would drift from the server on repeated tax/discount math).
 */
const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
const toRupees = (paise) => Math.round(paise) / 100;
const roundPaise = (paise) => Math.round(paise);

const calculateDiscountAmountPaise = (percentageBasePaise, discountType, discountValue, capPaise) => {
  if (!discountType || !discountValue) return 0;

  let amount;
  if (discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE) {
    amount = roundPaise((percentageBasePaise * Number(discountValue)) / 100);
  } else if (discountType === QUOTATION_DISCOUNT_TYPE.FIXED) {
    amount = roundPaise(toPaise(discountValue));
  } else {
    return 0;
  }

  return Math.max(0, Math.min(amount, capPaise));
};

export const calculateQuotationItemPreview = ({
  quantity,
  rate,
  discountType = null,
  discountValue = 0,
  taxRate = 0,
}) => {
  const lineSubtotalPaise = roundPaise(Number(quantity || 0) * toPaise(rate));
  const discountAmountPaise = calculateDiscountAmountPaise(
    lineSubtotalPaise,
    discountType,
    discountValue,
    lineSubtotalPaise,
  );
  const taxableAmountPaise = lineSubtotalPaise - discountAmountPaise;
  const taxAmountPaise = roundPaise((taxableAmountPaise * Number(taxRate || 0)) / 100);
  const lineTotalPaise = taxableAmountPaise + taxAmountPaise;

  return {
    lineSubtotal: toRupees(lineSubtotalPaise),
    discountAmount: toRupees(discountAmountPaise),
    taxAmount: toRupees(taxAmountPaise),
    lineTotal: toRupees(lineTotalPaise),
  };
};

// Same output shape as the backend's serialized quotation (subtotal,
// itemDiscountTotal, globalDiscount, taxTotal, shippingCharge, otherCharges,
// grandTotal) so it can be handed straight to QuotationAmountSummary.
export const calculateQuotationTotalsPreview = ({
  items = [],
  globalDiscount = null,
  shippingCharge = 0,
  otherCharges = 0,
}) => {
  const computedItems = items.map((item) => ({ ...item, ...calculateQuotationItemPreview(item) }));

  const subtotalPaise = computedItems.reduce((sum, item) => sum + toPaise(item.lineSubtotal), 0);
  const itemDiscountTotalPaise = computedItems.reduce((sum, item) => sum + toPaise(item.discountAmount), 0);
  const taxableSubtotalPaise = subtotalPaise - itemDiscountTotalPaise;
  const taxTotalPaise = computedItems.reduce((sum, item) => sum + toPaise(item.taxAmount), 0);
  const itemTotalSumPaise = computedItems.reduce((sum, item) => sum + toPaise(item.lineTotal), 0);

  const globalDiscountAmountPaise = calculateDiscountAmountPaise(
    taxableSubtotalPaise,
    globalDiscount?.type ?? null,
    globalDiscount?.value ?? 0,
    itemTotalSumPaise,
  );

  const normalizedShippingPaise = Math.max(0, roundPaise(toPaise(shippingCharge)));
  const normalizedOtherChargesPaise = Math.max(0, roundPaise(toPaise(otherCharges)));

  const grandTotalPaise = Math.max(
    0,
    itemTotalSumPaise - globalDiscountAmountPaise + normalizedShippingPaise + normalizedOtherChargesPaise,
  );

  return {
    items: computedItems,
    subtotal: toRupees(subtotalPaise),
    itemDiscountTotal: toRupees(itemDiscountTotalPaise),
    taxTotal: toRupees(taxTotalPaise),
    globalDiscount: {
      type: globalDiscount?.type ?? null,
      value: globalDiscount?.value ?? 0,
      amount: toRupees(globalDiscountAmountPaise),
    },
    shippingCharge: toRupees(normalizedShippingPaise),
    otherCharges: toRupees(normalizedOtherChargesPaise),
    grandTotal: toRupees(grandTotalPaise),
  };
};
