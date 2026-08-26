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
      <td className="min-w-[180px] px-3 py-3">
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
      <td className="w-40 px-3 py-3">
        <input
          aria-label={`Quantity for ${productLabel}`}
          className="form-field"
          min="0.001"
          onChange={(event) => update({ quantity: event.target.value })}
          step="any"
          type="number"
          value={item.quantity}
        />
      </td>
      <td className="w-36 px-3 py-3">
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
      <td className="w-56 px-3 py-3">
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
      <td className="w-28 px-3 py-3">
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
      <td className="px-3 py-3 text-right">
        <p className="font-semibold text-ink">{formatQuotationAmount(preview.lineSubtotal)}</p>
        <p className="text-xs text-muted">
          Tax {formatQuotationAmount(preview.taxAmount)}
          {Number(preview.discountAmount) > 0 ? ` · Disc. ${formatQuotationAmount(preview.discountAmount)}` : ""}
        </p>
        <p className="font-black text-forest">{formatQuotationAmount(preview.lineTotal)}</p>
      </td>
      <td className="w-12 px-3 py-3 text-right">
        <button
          aria-label={`Remove ${item.product?.name || "item"}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
          onClick={onRemove}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
