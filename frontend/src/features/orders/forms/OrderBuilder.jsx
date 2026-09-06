import { Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import TextInput from "../../../shared/forms/TextInput";
import { formatMoney } from "../../../shared/utils";
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
  const taxAmount = (lineSubtotal * toNumber(item.taxRate)) / 100;
  return { lineSubtotal, taxAmount, lineTotal: lineSubtotal + taxAmount };
};

/**
 * Takes an order straight from a lead — the field path, with no
 * quotation behind it.
 *
 * Kept deliberately smaller than QuotationBuilder: no validity dates, no
 * terms and conditions, no global discount, no revision handling. A field
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

  const handleAddProduct = (product) => {
    setItems((current) => [
      ...current,
      {
        product,
        quantity: "1",
        rate: String(product.sellingPrice ?? 0),
        taxRate: String(product.taxRate ?? 0),
        description: "",
      },
    ]);
    setErrors((current) => ({ ...current, items: "" }));
  };

  const updateItem = (index, field, value) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const removeItem = (index) => setItems((current) => current.filter((_, i) => i !== index));

  const itemsPreview = items.map(previewLine);
  const subtotal = itemsPreview.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const taxTotal = itemsPreview.reduce((sum, line) => sum + line.taxAmount, 0);
  const grandTotal = subtotal + taxTotal + toNumber(shippingCharge) + toNumber(otherCharges);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!lead) nextErrors.lead = "Choose the customer this order is for.";
    if (!items.length) nextErrors.items = "Add at least one product.";
    if (items.some((item) => toNumber(item.quantity) <= 0)) {
      nextErrors.items = "Every line needs a quantity greater than zero.";
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
          <OrderLeadSelector locked={Boolean(initialLead)} onSelect={setLead} selectedLead={lead} />
        </div>
        {errors.lead ? <p className="mt-2 text-sm font-semibold text-red-700">{errors.lead}</p> : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Items</h2>

        <div className="mt-4">
          <QuotationProductSelector
            excludeProductIds={items.map((item) => item.product._id)}
            onSelect={handleAddProduct}
          />
        </div>

        {errors.items ? <p className="mt-3 text-sm font-semibold text-red-700">{errors.items}</p> : null}

        {items.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-forest/10 text-left text-xs font-black uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3 w-28">Qty</th>
                  <th className="py-2 pr-3 w-32">Rate</th>
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
                    <td className="py-2.5 pr-3">
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
                    <td className="py-2.5 pr-3">
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
                    <td className="py-2.5 pr-3">
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
                    <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-ink">
                      {formatMoney(itemsPreview[index].lineTotal)}
                    </td>
                    <td className="py-2.5">
                      <button
                        aria-label={`Remove ${item.product.name}`}
                        className="rounded-lg p-2 text-red-700 transition hover:bg-red-50"
                        onClick={() => removeItem(index)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
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
