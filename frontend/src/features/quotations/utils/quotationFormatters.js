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
export const formatQuotationItemDiscount = (item) => {
  if (!item?.discountType || !Number(item?.discountAmount)) return "-";
  const suffix =
    item.discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE
      ? `${item.discountValue}%`
      : formatQuotationAmount(item.discountValue);
  return `${suffix} (- ${formatQuotationAmount(item.discountAmount)})`;
};
