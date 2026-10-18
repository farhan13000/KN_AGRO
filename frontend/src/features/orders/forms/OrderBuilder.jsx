import { Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import TextInput from "../../../shared/forms/TextInput";
import { DEFAULT_LEAD_TYPE, getLeadTypeLabel, priceForLeadType } from "../../../shared/constants";
import { formatMoney } from "../../../shared/utils";
// Same discount vocabulary as a quotation, so an order's discount means
// exactly what a quotation's does and converts between the two cleanly.
import { QUOTATION_DISCOUNT_TYPE, QUOTATION_DISCOUNT_TYPE_LABELS } from "../../quotations/constants";
// The product picker is genuinely generic — "choose an active product" —
// so it is reused rather than copied. The lead picker is not: see
// OrderLeadSelector's own note on why an order accepts any active lead.
import QuotationProductSelector from "../../quotations/components/QuotationProductSelector";
import OrderLeadSelector from "../components/OrderLeadSelector";

const toNumber = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Preview only. The server recomputes every one of these figures from the
 * live Product and its own calculator before anything is stored (see
 * resolveDirectOrderItems), so this exists purely so the person taking
 * the order can see the total they are quoting out loud — it is never
 * sent, and never authoritative.
 */
const previewLine = (item) => {
  const lineSubtotal = toNumber(item.quantity) * toNumber(item.rate);
  // Same order of operations as the server's calculateQuotationItem: the
  // discount comes off the line first, never more than the line itself,
  // and tax is charged on what is left. A FIXED discount is for the whole
  // line, not per unit.
  let discountAmount = 0;
  if (item.discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE) {
    discountAmount = (lineSubtotal * toNumber(item.discountValue)) / 100;
  } else if (item.discountType === QUOTATION_DISCOUNT_TYPE.FIXED) {
    discountAmount = toNumber(item.discountValue);
  }
  discountAmount = Math.max(0, Math.min(discountAmount, lineSubtotal));
  const taxableAmount = lineSubtotal - discountAmount;
  const taxAmount = (taxableAmount * toNumber(item.taxRate)) / 100;
  return { lineSubtotal, discountAmount, taxAmount, lineTotal: taxableAmount + taxAmount };
};

// Mirrors the backend's directOrderItemInputSchema: a discount type needs
// a value of 0 or more, and a percentage cannot exceed 100.
const isValidDiscount = (type, value) => {
  if (!type) return true;
  const text = String(value ?? "").trim();
  if (!text || !Number.isFinite(Number(text)) || Number(text) < 0) return false;
  if (type === QUOTATION_DISCOUNT_TYPE.PERCENTAGE && Number(text) > 100) return false;
  return true;
};

/**
 * Takes an order straight from a lead — the field path, with no
 * quotation behind it.
 *
 * Kept deliberately smaller than QuotationBuilder: no validity dates, no
 * terms and conditions, no global (whole-order) discount, no revision
 * handling — a discount is per line only. A field
 * officer standing with a customer needs "who, what, how many" and
 * nothing else; every field beyond that is one more thing to get wrong on
 * a phone screen.
 */
export default function OrderBuilder({
  initialLead = null,
  isSubmitting = false,
  onSubmit,
  submitError = "",
}) {
  const [lead, setLead] = useState(initialLead);
  const [items, setItems] = useState([]);
  const [shippingCharge, setShippingCharge] = useState("");
  const [otherCharges, setOtherCharges] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  // The rate starts at what THIS kind of buyer pays — a distributor's
  // price for a distributor — exactly as a quotation does, rather than
  // the plain selling price for everyone.
  const handleAddProduct = (product) => {
    setItems((current) => [
      ...current,
      {
        product,
        quantity: "1",
        rate: String(priceForLeadType(product, lead?.leadType)),
        rateEdited: false,
        taxRate: String(product.taxRate ?? 0),
        discountType: null,
        discountValue: "",
        description: "",
      },
    ]);
    setErrors((current) => ({ ...current, items: "" }));
  };

  // Picking a different customer re-prices every line at THEIR rate —
  // except a rate somebody typed by hand, which is a decision and stays.
  const handleLeadChange = (nextLead) => {
    setLead(nextLead);
    setItems((current) =>
      current.map((item) =>
        item.rateEdited ? item : { ...item, rate: String(priceForLeadType(item.product, nextLead?.leadType)) }
      )
    );
  };

  const updateItem = (index, field, value) =>
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value, ...(field === "rate" ? { rateEdited: true } : {}) } : item
      )
    );

  // Changing the type clears the value: 10 means something different as
  // a percentage than as rupees.
  const updateDiscountType = (index, discountType) =>
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, discountType: discountType || null, discountValue: "" } : item))
    );

  const removeItem = (index) => setItems((current) => current.filter((_, i) => i !== index));

  const itemsPreview = items.map(previewLine);
  const subtotal = itemsPreview.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const discountTotal = itemsPreview.reduce((sum, line) => sum + line.discountAmount, 0);
  const taxTotal = itemsPreview.reduce((sum, line) => sum + line.taxAmount, 0);
  const grandTotal = subtotal - discountTotal + taxTotal + toNumber(shippingCharge) + toNumber(otherCharges);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!lead) nextErrors.lead = "Choose the customer this order is for.";
    if (!items.length) nextErrors.items = "Add at least one product.";
    if (items.some((item) => toNumber(item.quantity) <= 0)) {
      nextErrors.items = "Every line needs a quantity greater than zero.";
    } else if (items.some((item) => !isValidDiscount(item.discountType, item.discountValue))) {
      nextErrors.items = "Enter a discount of 0 or more on every discounted line (a percentage can be at most 100).";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit({
      leadId: lead._id,
      items,
      shippingCharge,
      otherCharges,
      expectedDeliveryDate,
      notes,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Customer</h2>
        <div className="mt-4">
          <OrderLeadSelector locked={Boolean(initialLead)} onSelect={handleLeadChange} selectedLead={lead} />
        </div>
        {errors.lead ? <p className="mt-2 text-sm font-semibold text-red-700">{errors.lead}</p> : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Items</h2>
        {/* Says which price list the rates came from, so a distributor's
            rate is never mistaken for a mistake (or the other way round).
            With no customer, or one with no type, that is the default
            list — the same one priceForLeadType falls back to. */}
        <p className="mt-1 text-sm font-semibold text-muted">
          Rates are filled at the{" "}
          <span className="text-ink">{getLeadTypeLabel(lead?.leadType || DEFAULT_LEAD_TYPE)}</span> price
          {lead ? "" : " until you choose the customer"}. You can still change any rate or add a discount.
        </p>

        <div className="mt-4">
          <QuotationProductSelector
            excludeProductIds={items.map((item) => item.product._id)}
            onSelect={handleAddProduct}
          />
        </div>

        {errors.items ? <p className="mt-3 text-sm font-semibold text-red-700">{errors.items}</p> : null}

        {items.length ? (
          // Real table on a desktop screen; one card per item on a
          // phone — see `.item-grid` in index.css.
          // `relative`: the Remove button's `md:sr-only` label is
          // absolutely positioned, and without a positioned scroll box it
          // escapes it and widens the whole page (see DataTable).
          <div className="relative mt-4 md:overflow-x-auto">
            <table className="item-grid w-full text-sm md:min-w-[58rem]">
              <thead>
                <tr className="border-b border-forest/10 text-left text-xs font-black uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3 w-28">Qty</th>
                  <th className="py-2 pr-3 w-32">Rate</th>
                  <th className="py-2 pr-3 w-56">Discount</th>
                  <th className="py-2 pr-3 w-24">Tax %</th>
                  <th className="py-2 pr-3 w-32 text-right">Line Total</th>
                  <th className="py-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {items.map((item, index) => (
                  <tr key={item.product._id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-black text-ink">{item.product.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-muted">
                        {[item.product.productCode, item.product.unit].filter(Boolean).join(" | ")}
                      </p>
                    </td>
                    <td className="py-2.5 md:pr-3">
                      <span className="item-grid-label">Qty</span>
                      <input
                        aria-label={`Quantity for ${item.product.name}`}
                        className="form-field"
                        min="0.001"
                        name={`quantity-${index}`}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        step="any"
                        type="number"
                        value={item.quantity}
                      />
                    </td>
                    <td className="py-2.5 md:pr-3">
                      <span className="item-grid-label">Rate</span>
                      <input
                        aria-label={`Rate for ${item.product.name}`}
                        className="form-field"
                        min="0"
                        name={`rate-${index}`}
                        onChange={(event) => updateItem(index, "rate", event.target.value)}
                        step="any"
                        type="number"
                        value={item.rate}
                      />
                    </td>
                    <td className="py-2.5 md:pr-3">
                      <span className="item-grid-label">Discount</span>
                      <div className="flex gap-2">
                        <select
                          aria-label={`Discount type for ${item.product.name}`}
                          className="form-field"
                          name={`discountType-${index}`}
                          onChange={(event) => updateDiscountType(index, event.target.value)}
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
                            aria-label={`Discount value for ${item.product.name}`}
                            className="form-field"
                            max={item.discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE ? "100" : undefined}
                            min="0"
                            name={`discountValue-${index}`}
                            onChange={(event) => updateItem(index, "discountValue", event.target.value)}
                            placeholder={item.discountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE ? "%" : "₹ for the line"}
                            step="any"
                            type="number"
                            value={item.discountValue}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2.5 md:pr-3">
                      <span className="item-grid-label">Tax %</span>
                      <input
                        aria-label={`Tax rate for ${item.product.name}`}
                        className="form-field"
                        max="100"
                        min="0"
                        name={`taxRate-${index}`}
                        onChange={(event) => updateItem(index, "taxRate", event.target.value)}
                        step="any"
                        type="number"
                        value={item.taxRate}
                      />
                    </td>
                    <td className="py-2.5 font-semibold tabular-nums text-ink md:pr-3 md:text-right">
                      <span className="item-grid-label">Line total</span>
                      {formatMoney(itemsPreview[index].lineTotal)}
                    </td>
                    <td className="py-2.5">
                      <button
                        aria-label={`Remove ${item.product.name}`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg p-2 text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 md:min-h-0 md:w-auto md:ring-0"
                        onClick={() => removeItem(index)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm font-bold md:sr-only">Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Charges &amp; Delivery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextInput
            id="order-shipping"
            label="Shipping Charge"
            min="0"
            onChange={(event) => setShippingCharge(event.target.value)}
            step="any"
            type="number"
            value={shippingCharge}
          />
          <TextInput
            id="order-other"
            label="Other Charges"
            min="0"
            onChange={(event) => setOtherCharges(event.target.value)}
            step="any"
            type="number"
            value={otherCharges}
          />
          <TextInput
            id="order-delivery"
            label="Expected Delivery"
            onChange={(event) => setExpectedDeliveryDate(event.target.value)}
            type="date"
            value={expectedDeliveryDate}
          />
        </div>
        <label className="mt-4 block">
          <span className="form-label">Notes</span>
          <textarea
            className="form-field"
            name="notes"
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            value={notes}
          />
        </label>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-ink">Total</h2>
            {/* Said out loud to the customer, then recomputed by the
                server on submit — if the two ever disagree, the server's
                figure is the one that lands on the order. */}
            <p className="mt-1 text-xs font-semibold text-muted">
              Estimate. The final amount is recalculated by the server when the order is saved.
            </p>
          </div>
          <dl className="text-right text-sm">
            <div className="flex justify-between gap-8">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold tabular-nums text-ink">{formatMoney(subtotal)}</dd>
            </div>
            {discountTotal > 0 ? (
              <div className="flex justify-between gap-8">
                <dt className="text-muted">Discount</dt>
                <dd className="font-semibold tabular-nums text-ink">- {formatMoney(discountTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-8">
              <dt className="text-muted">Tax</dt>
              <dd className="font-semibold tabular-nums text-ink">{formatMoney(taxTotal)}</dd>
            </div>
            <div className="mt-1 flex justify-between gap-8 border-t border-forest/10 pt-1">
              <dt className="font-black text-ink">Grand Total</dt>
              <dd className="text-lg font-black tabular-nums text-forest">{formatMoney(grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </Card>

      {submitError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
