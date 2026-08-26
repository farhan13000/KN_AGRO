import { useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import QuotationAmountSummary from "../components/QuotationAmountSummary";
import QuotationItemEditableRow from "../components/QuotationItemEditableRow";
import QuotationLeadSelector from "../components/QuotationLeadSelector";
import QuotationProductSelector from "../components/QuotationProductSelector";
import { QUOTATION_DISCOUNT_TYPE, QUOTATION_DISCOUNT_TYPE_LABELS } from "../constants";
import { calculateQuotationTotalsPreview } from "../utils";

const discountTypeOptions = [
  { label: "No additional discount", value: "" },
  ...Object.values(QUOTATION_DISCOUNT_TYPE).map((type) => ({
    label: QUOTATION_DISCOUNT_TYPE_LABELS[type],
    value: type,
  })),
];

const defaultValidUntil = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
};

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

// Rebuilds the builder's editable-item shape from a saved quotation's
// snapshot fields (edit mode only). This is a starting point for further
// edits, not a re-fetch of live Product data — the snapshot itself already
// carries everything the row needs to display and preview correctly.
const mapQuotationItemsToEditable = (items = []) =>
  items.map((item) => ({
    description: item.description || "",
    discountType: item.discountType || null,
    discountValue: item.discountType ? String(item.discountValue ?? "") : "",
    product: {
      _id: item.product,
      name: item.productName,
      productCode: item.productCode,
      sellingPrice: item.rate,
      taxRate: item.taxRate,
      unit: item.unit,
    },
    quantity: item.quantity,
    rate: item.rate,
    taxRate: item.taxRate,
  }));

const isValidNumber = (value) => value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));

const isValidDiscount = (type, value) => {
  if (!type) return true;
  if (!isValidNumber(value) || Number(value) < 0) return false;
  if (type === QUOTATION_DISCOUNT_TYPE.PERCENTAGE && Number(value) > 100) return false;
  return true;
};

// Mirrors the backend's create/update item schema exactly (quotation.
// validation.js#quotationItemInputSchema) — quantity > 0, rate/taxRate not
// negative, taxRate <= 100, and a discountType always needs a valid
// discountValue. Nothing here is a stricter, invented rule.
const hasInvalidItem = (items) =>
  items.some((item) => {
    if (!item.quantity || Number(item.quantity) <= 0) return true;
    if (item.rate !== "" && item.rate !== undefined && Number(item.rate) < 0) return true;
    if (item.taxRate !== "" && item.taxRate !== undefined) {
      const taxRate = Number(item.taxRate);
      if (taxRate < 0 || taxRate > 100) return true;
    }
    return !isValidDiscount(item.discountType, item.discountValue);
  });

// Owns all of its own state (unlike LeadForm, which is a fully controlled
// dumb form driven by its single page owner) because this builder is
// reused, unmodified, by both the Super Admin and Sales Manager create
// pages — pushing lead/items/charges state up into each page would
// duplicate the exact domain logic phase5.md explicitly forbids
// duplicating per role. Pages only supply `initialLead`, `onSubmit`,
// `isSubmitting`, and `submitError`.
export const validateQuotationDraft = ({
  globalDiscountType,
  globalDiscountValue,
  items,
  lead,
  otherCharges,
  shippingCharge,
  validUntil,
}) => {
  const errors = {};
  if (!lead) errors.lead = "Select a qualified lead.";

  if (!items.length) {
    errors.items = "Add at least one product.";
  } else if (hasInvalidItem(items)) {
    errors.items =
      "Check every item: quantity must be greater than 0, rate/tax can't be negative, and a discount type needs a valid value (percentage up to 100).";
  }

  if (!isValidDiscount(globalDiscountType, globalDiscountValue)) {
    errors.globalDiscount = globalDiscountType
      ? "Enter a valid discount value (percentage up to 100)."
      : undefined;
  }

  if (shippingCharge !== "" && shippingCharge !== undefined && Number(shippingCharge) < 0) {
    errors.shippingCharge = "Shipping charge cannot be negative.";
  }
  if (otherCharges !== "" && otherCharges !== undefined && Number(otherCharges) < 0) {
    errors.otherCharges = "Other charges cannot be negative.";
  }

  if (!validUntil) {
    errors.validUntil = "Set a validity date.";
  } else if (new Date(validUntil).getTime() <= Date.now()) {
    errors.validUntil = "Validity date must be in the future.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

// `initialQuotation`, when provided, switches this into edit mode: the Lead
// becomes locked (the update schema has no `leadId` field — see
// QuotationLeadSelector's `locked` doc comment), fields are seeded from the
// saved record, and the submit button reads "Save Changes". Both props are
// only ever read once, on mount — the owning page is responsible for
// waiting until its fetch resolves before rendering this component (same
// pattern the Create pages already use for `initialLead`), so there is no
// need to re-sync state if the prop identity changes later.
export default function QuotationBuilder({
  initialLead = null,
  initialQuotation = null,
  isSubmitting = false,
  onSubmit,
  submitError = "",
}) {
  const isEditMode = Boolean(initialQuotation);
  const [lead, setLead] = useState(() => initialQuotation?.lead || initialLead);
  const [items, setItems] = useState(() => mapQuotationItemsToEditable(initialQuotation?.items));
  const [globalDiscountType, setGlobalDiscountType] = useState(() => initialQuotation?.globalDiscount?.type || "");
  const [globalDiscountValue, setGlobalDiscountValue] = useState(() =>
    initialQuotation?.globalDiscount?.type ? String(initialQuotation.globalDiscount.value ?? "") : "",
  );
  const [shippingCharge, setShippingCharge] = useState(() =>
    initialQuotation?.shippingCharge ? String(initialQuotation.shippingCharge) : "",
  );
  const [otherCharges, setOtherCharges] = useState(() =>
    initialQuotation?.otherCharges ? String(initialQuotation.otherCharges) : "",
  );
  const [validUntil, setValidUntil] = useState(() =>
    initialQuotation?.validUntil
      ? new Date(initialQuotation.validUntil).toISOString().slice(0, 10)
      : defaultValidUntil(),
  );
  const [termsAndConditions, setTermsAndConditions] = useState(() => initialQuotation?.termsAndConditions || "");
  const [notes, setNotes] = useState(() => initialQuotation?.notes || "");
  const [errors, setErrors] = useState({});

  const handleAddProduct = (product) => {
    setItems((current) => [
      ...current,
      {
        description: "",
        discountType: null,
        discountValue: "",
        product,
        quantity: 1,
        rate: product.sellingPrice ?? 0,
        taxRate: product.taxRate ?? 0,
      },
    ]);
  };

  const handleItemChange = (index, nextItem) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
  };

  const handleItemRemove = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const previewTotals = useMemo(
    () =>
      calculateQuotationTotalsPreview({
        globalDiscount: globalDiscountType
          ? { type: globalDiscountType, value: Number(globalDiscountValue) || 0 }
          : null,
        items: items.map((item) => ({
          discountType: item.discountType || null,
          discountValue: Number(item.discountValue) || 0,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          taxRate: Number(item.taxRate) || 0,
        })),
        otherCharges: Number(otherCharges) || 0,
        shippingCharge: Number(shippingCharge) || 0,
      }),
    [globalDiscountType, globalDiscountValue, items, otherCharges, shippingCharge],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateQuotationDraft({
      globalDiscountType,
      globalDiscountValue,
      items,
      lead,
      otherCharges,
      shippingCharge,
      validUntil,
    });
    setErrors(validation.errors);
    if (!validation.isValid) return;

    await onSubmit({
      globalDiscount: globalDiscountType ? { type: globalDiscountType, value: globalDiscountValue } : undefined,
      items: items.map((item) => ({
        description: item.description,
        discountType: item.discountType,
        discountValue: item.discountValue,
        product: item.product,
        quantity: item.quantity,
        rate: item.rate,
        taxRate: item.taxRate,
      })),
      leadId: lead._id,
      notes,
      otherCharges,
      shippingCharge,
      termsAndConditions,
      validUntil,
    });
  };

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <section>
        <h2 className="text-lg font-black text-ink">Lead</h2>
        <div className="mt-4">
          <QuotationLeadSelector locked={isEditMode} onSelect={setLead} selectedLead={lead} />
          {errors.lead ? <p className="form-error mt-2">{errors.lead}</p> : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Quotation Items</h2>
        <div className="mt-4 space-y-4">
          <QuotationProductSelector
            excludeProductIds={items.map((item) => item.product._id)}
            onSelect={handleAddProduct}
          />
          {errors.items ? <p className="form-error">{errors.items}</p> : null}
          {items.length ? (
            <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white">
              <table className="w-full min-w-[880px] divide-y divide-forest/10 text-left text-sm">
                <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
                  <tr>
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Quantity</th>
                    <th className="px-3 py-3">Rate</th>
                    <th className="px-3 py-3">Discount</th>
                    <th className="px-3 py-3">Tax %</th>
                    <th className="px-3 py-3 text-right">Line Total</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10">
                  {items.map((item, index) => (
                    <QuotationItemEditableRow
                      item={item}
                      key={item.product._id}
                      onChange={(nextItem) => handleItemChange(index, nextItem)}
                      onRemove={() => handleItemRemove(index)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Commercial Adjustments</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Select
            id="quotation-global-discount-type"
            label="Additional Discount"
            onChange={(event) => {
              setGlobalDiscountType(event.target.value);
              setGlobalDiscountValue("");
            }}
            options={discountTypeOptions}
            value={globalDiscountType}
          />
          {globalDiscountType ? (
            <div>
              <label className="form-label" htmlFor="quotation-global-discount-value">
                {globalDiscountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE ? "Percentage" : "Amount"}
              </label>
              <input
                aria-describedby={errors.globalDiscount ? "quotation-global-discount-value-error" : undefined}
                aria-invalid={Boolean(errors.globalDiscount)}
                className="form-field"
                id="quotation-global-discount-value"
                max={globalDiscountType === QUOTATION_DISCOUNT_TYPE.PERCENTAGE ? "100" : undefined}
                min="0"
                onChange={(event) => setGlobalDiscountValue(event.target.value)}
                step="0.01"
                type="number"
                value={globalDiscountValue}
              />
            </div>
          ) : null}
        </div>
        {errors.globalDiscount ? (
          <p className="form-error mt-2" id="quotation-global-discount-value-error">
            {errors.globalDiscount}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Shipping / Other Charges</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="quotation-shipping-charge">
              Shipping Charge
            </label>
            <input
              aria-describedby={errors.shippingCharge ? "quotation-shipping-charge-error" : undefined}
              aria-invalid={Boolean(errors.shippingCharge)}
              className="form-field"
              id="quotation-shipping-charge"
              min="0"
              onChange={(event) => setShippingCharge(event.target.value)}
              step="0.01"
              type="number"
              value={shippingCharge}
            />
            {errors.shippingCharge ? (
              <p className="form-error" id="quotation-shipping-charge-error">
                {errors.shippingCharge}
              </p>
            ) : null}
          </div>
          <div>
            <label className="form-label" htmlFor="quotation-other-charges">
              Other Charges
            </label>
            <input
              aria-describedby={errors.otherCharges ? "quotation-other-charges-error" : undefined}
              aria-invalid={Boolean(errors.otherCharges)}
              className="form-field"
              id="quotation-other-charges"
              min="0"
              onChange={(event) => setOtherCharges(event.target.value)}
              step="0.01"
              type="number"
              value={otherCharges}
            />
            {errors.otherCharges ? (
              <p className="form-error" id="quotation-other-charges-error">
                {errors.otherCharges}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Validity, Notes &amp; Terms</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="quotation-valid-until">
              Valid Until <span className="text-red-700">*</span>
            </label>
            <input
              aria-describedby={errors.validUntil ? "quotation-valid-until-error" : undefined}
              aria-invalid={Boolean(errors.validUntil)}
              className="form-field"
              id="quotation-valid-until"
              min={tomorrow()}
              onChange={(event) => setValidUntil(event.target.value)}
              type="date"
              value={validUntil}
            />
            {errors.validUntil ? (
              <p className="form-error" id="quotation-valid-until-error">
                {errors.validUntil}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Textarea
              id="quotation-notes"
              label="Notes"
              maxLength={2000}
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              id="quotation-terms"
              label="Terms &amp; Conditions"
              maxLength={5000}
              onChange={(event) => setTermsAndConditions(event.target.value)}
              value={termsAndConditions}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Preview Summary</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          Preview only — the backend response after saving is authoritative.
        </p>
        <div className="mt-4 rounded-lg border border-forest/10 bg-white p-5">
          <QuotationAmountSummary quotation={previewTotals} />
        </div>
      </section>

      {submitError ? <p className="form-error">{submitError}</p> : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Draft"}
        </Button>
      </div>
    </form>
  );
}
