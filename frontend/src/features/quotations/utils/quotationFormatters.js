import { formatMoney } from "../../../shared/utils/money.js";
import { QUOTATION_DISCOUNT_TYPE, QUOTATION_STATUS_LABELS } from "../constants/quotation.constants.js";

export const formatQuotationStatus = (status) => QUOTATION_STATUS_LABELS[status] || status || "Unknown";

// Preview-safe formatter — callers may pass either a saved (backend)
// amount or a locally-computed preview amount; this never claims either
// one is authoritative, it only renders whatever number it is given.
export const formatQuotationAmount = (value) => formatMoney(value);

export const getQuotationDisplayNumber = (quotation) => quotation?.quotationNumber || "Draft Quotation";

// Renders a saved item's own discount snapshot (discountType/discountValue/
// discountAmount) — never recomputed, always the stored historical value.
// A word joiner (U+2060, invisible) plus a non-breaking space. The print
// view passes this as `separator` so a narrow column wraps the text at
// "10% | (- ₹55.00)", never as "10% (- | ₹55.00)". A non-breaking space
// alone is not enough: line breaking still allows a break right after a
// hyphen.
export const UNBREAKABLE_DISCOUNT_SEPARATOR = "⁠ ";

// `formatAmount` and `separator` are for the print view (paise always
// shown, no break inside the bracket); every other caller gets exactly
// the text it always had, "10% (- ₹20)".
export const formatQuotationItemDiscount = (item, formatAmount = formatQuotationAmount, separator = " ") => {
  if (!item?.discountType || !Number(item?.discountAmount)) return "-";
  const suffix =
    item.discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE
      ? `${item.discountValue}%`
      : formatAmount(item.discountValue);
  return `${suffix} (-${separator}${formatAmount(item.discountAmount)})`;
};
