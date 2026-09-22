import { Trash2 } from "lucide-react";
import { QUOTATION_DISCOUNT_TYPE, QUOTATION_DISCOUNT_TYPE_LABELS } from "../constants";
import { calculateQuotationItemPreview, formatQuotationAmount } from "../utils";
import { getProductUnitLabel } from "../../products";

// Editable fields match exactly what the backend create/update item schema
// accepts (productId, quantity, rate?, discountType?, discountValue?,
// taxRate?, description?) — everything else about the product (code, name,
// unit) is display-only context captured at selection time, never submitted.
// Each cell's control has an `aria-label` (Prompt 52) since the visible
// context here is the shared column `<th>` header, not a per-cell
// `<label>` — a screen reader landing on one of these inputs directly
// (e.g. via Tab) would otherwise announce nothing but "number, edit text".
export default function QuotationItemEditableRow({ item, onChange, onRemove }) {
  const preview = calculateQuotationItemPreview(item);
  const update = (patch) => onChange({ ...item, ...patch });
  const productLabel = item.product?.name || "item";

  return (
    <tr className="align-top">
      <td className="px-3 py-3 md:min-w-[180px]">
        <p className="font-black text-forest">{item.product?.productCode || "Not Set"}</p>
        <p className="text-sm font-semibold text-ink">{item.product?.name || "Unnamed Product"}</p>
        <p className="text-xs text-muted">{getProductUnitLabel(item.product?.unit)}</p>
        <input
          aria-label={`Description for ${productLabel}`}
          className="form-field mt-2 text-xs"
          onChange={(event) => update({ description: event.target.value })}
          placeholder="Description (optional)"
          type="text"
          value={item.description || ""}
        />
      </td>
      <td className="px-3 py-3 md:w-40">
        <span className="item-grid-label">Quantity</span>
        {/* The unit sits beside the number, not only up in the product
            cell: this column is where the figure is actually read and
            changed, and 12 bags is not 12 packets. */}
        <div className="flex items-center gap-2">
          <input
            aria-label={`Quantity for ${productLabel}`}
            className="form-field"
            min="0.001"
            onChange={(event) => update({ quantity: event.target.value })}
            step="any"
            type="number"
            value={item.quantity}
          />
          <span className="shrink-0 text-xs font-bold text-muted">
            {getProductUnitLabel(item.product?.unit)}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 md:w-36">
        <span className="item-grid-label">Rate</span>
        <input
          aria-label={`Rate for ${productLabel}`}
          className="form-field"
          min="0"
          onChange={(event) => update({ rate: event.target.value })}
          step="0.01"
          type="number"
          value={item.rate}
        />
      </td>
      <td className="px-3 py-3 md:w-56">
        <span className="item-grid-label">Discount</span>
        <div className="flex gap-2">
          <select
            aria-label={`Discount type for ${productLabel}`}
            className="form-field"
            onChange={(event) => update({ discountType: event.target.value || null, discountValue: "" })}
            value={item.discountType || ""}
          >
            <option value="">No discount</option>
            {Object.values(QUOTATION_DISCOUNT_TYPE).map((type) => (
              <option key={type} value={type}>
                {QUOTATION_DISCOUNT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {item.discountType ? (
            <input
              aria-label={`Discount value for ${productLabel}`}
              className="form-field"
              min="0"
              max={item.discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE ? "100" : undefined}
              onChange={(event) => update({ discountValue: event.target.value })}
              step="0.01"
              type="number"
              value={item.discountValue}
            />
          ) : null}
        </div>
      </td>
      <td className="px-3 py-3 md:w-28">
        <span className="item-grid-label">Tax %</span>
        <input
          aria-label={`Tax rate for ${productLabel}`}
          className="form-field"
          max="100"
          min="0"
          onChange={(event) => update({ taxRate: event.target.value })}
          step="0.01"
          type="number"
          value={item.taxRate}
        />
      </td>
      <td className="px-3 py-3 md:text-right">
        <span className="item-grid-label">Line total</span>
        <p className="font-semibold text-ink">{formatQuotationAmount(preview.lineSubtotal)}</p>
        <p className="text-xs text-muted">
          Tax {formatQuotationAmount(preview.taxAmount)}
          {Number(preview.discountAmount) > 0 ? ` · Disc. ${formatQuotationAmount(preview.discountAmount)}` : ""}
        </p>
        <p className="font-black text-forest">{formatQuotationAmount(preview.lineTotal)}</p>
      </td>
      <td className="px-3 py-3 md:w-12 md:text-right">
        <button
          aria-label={`Remove ${item.product?.name || "item"}`}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 md:h-9 md:min-h-0 md:w-9"
          onClick={onRemove}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm font-bold md:sr-only">Remove</span>
        </button>
      </td>
    </tr>
  );
}
