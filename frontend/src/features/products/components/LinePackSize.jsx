import { describeLinePackSizeParts } from "../utils/productFormatters";

/**
 * The small pack-size note under a quotation, order or invoice line's
 * quantity — "50 Kg each" and, on its own line, "100 Kg total". Two
 * lines rather than one joined by "·": in a narrow Qty column one long
 * line broke in the middle ("100 / Kg total").
 *
 * Reads the pack size SAVED on the line, never the product's current
 * one, so a printed bill keeps saying what was sold. Renders nothing for
 * a line without one.
 */
export default function LinePackSize({ packSize, quantity }) {
  const parts = describeLinePackSizeParts(packSize, quantity);
  if (!parts) return null;
  return (
    <>
      <span className="block text-xs font-normal text-muted">{parts.each}</span>
      {parts.total ? <span className="block text-xs font-normal text-muted">{parts.total}</span> : null}
    </>
  );
}
