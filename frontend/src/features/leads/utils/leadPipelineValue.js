/**
 * A lead's pipeline value, worked out from the products it is for.
 *
 * Three things go into it, and all three come from the catalogue rather
 * than from whoever is typing:
 *
 *   - the SELLING PRICE the Super Admin or Office Admin set on the
 *     product, so two people entering the same enquiry get the same
 *     figure and nobody has to remember a rate;
 *   - the QUANTITY, when someone stated one — a lead may simply record
 *     "they asked about DAP" with no number, and one unit is the honest
 *     reading of that;
 *   - the product's own TAX RATE, because the pipeline figure is what
 *     the customer would actually pay, which is what a business plans
 *     against.
 *
 * The figure stays editable. The real rate is settled on the quotation,
 * where it can be negotiated per item — this is only the opening
 * estimate.
 */
const lineTotal = ({ price, taxRate }, quantity) => {
  const rate = Number(price) || 0;
  const tax = Number(taxRate) || 0;
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;
  return rate * qty * (1 + tax / 100);
};

/**
 * @param selectedIds product ids currently ticked
 * @param productOptions the catalogue rows, carrying `price` and `taxRate`
 * @param quantities     `{ [productId]: quantity }`, partial and optional
 * @returns a string for the number input, or "" when nothing is selected
 */
export const pipelineValueFromProducts = (selectedIds = [], productOptions = [], quantities = {}) => {
  if (!selectedIds.length) return "";

  const optionById = new Map(productOptions.map((option) => [String(option.value), option]));
  const total = selectedIds.reduce((sum, id) => {
    const option = optionById.get(String(id));
    return option ? sum + lineTotal(option, quantities[String(id)]) : sum;
  }, 0);

  // Money, so two decimals — trimmed of a trailing ".00" so the box shows
  // "2700" rather than "2700.00".
  return String(Number(total.toFixed(2)));
};
