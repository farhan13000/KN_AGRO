import Button from "../../../shared/components/Button";
import { LEAD_TYPE_OPTIONS } from "../../../shared/constants";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { ROUTES } from "../../../shared/constants";
import { useLanguage } from "../../../i18n/LanguageContext";
import ProductImagesField from "../components/ProductImagesField";
import { MEASURE_UNITS, PACK_SIZE_UNIT_LABELS, PACK_UNITS, PRODUCT_UNIT, PRODUCT_UNIT_LABELS } from "../constants";
import { formatPackSize } from "../utils/productFormatters";

const packSizeUnitOptions = Object.entries(PACK_SIZE_UNIT_LABELS).map(([value, label]) => ({ label, value }));

const isBlank = (value) => String(value ?? "").trim() === "";

/**
 * The Selling Unit choices, grouped so the list reads as two kinds of
 * product rather than eleven words: things sold in a pack, and things
 * weighed out loose.
 *
 * Once a pack size is filled in, only the pack group is offered — "per
 * Kilogram" with a 50 Kg pack is the combination that billed a bag's
 * price for every kilogram, so it is not shown rather than shown and then
 * refused. A unit already saved on the product always stays in the list,
 * even when the filter would hide it, so the box never claims a value the
 * product does not have; the form's validation then asks for it to be
 * changed.
 */
const sellingUnitGroups = (hasPackSize, currentUnit) => {
  const groups = hasPackSize
    ? [{ label: "Sold by the pack", units: [...PACK_UNITS, PRODUCT_UNIT.OTHER] }]
    : [
        { label: "Sold by the pack", units: PACK_UNITS },
        { label: "Sold loose (by weight or volume)", units: MEASURE_UNITS },
        { label: "Other", units: [PRODUCT_UNIT.OTHER] },
      ];
  const offered = groups.flatMap((group) => group.units);
  if (currentUnit && !offered.includes(currentUnit)) {
    groups.push({ label: "Current unit (please change)", units: [currentUnit] });
  }
  return groups;
};

export default function ProductForm({
  categoryOptions = [],
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Save Product",
  values,
}) {
  const { t } = useLanguage();
  const hasPackSize = !isBlank(values.packSize?.value);
  const unitGroups = sellingUnitGroups(hasPackSize, values.unit);

  // Typing a pack size while the unit is still a weight (Kilogram) moves
  // the unit to Bag in the same step, since Kilogram is no longer offered.
  // It is visible — the box now reads "Bag" and the note under it says
  // what prices are per — and can be changed to Packet or Bottle.
  const handlePackSizeChange = (event) => {
    onChange(event);
    if (!isBlank(event.target.value) && MEASURE_UNITS.includes(values.unit)) {
      onChange({ target: { name: "unit", value: PRODUCT_UNIT.BAG } });
    }
  };

  return (
    <form className="space-y-7" onSubmit={onSubmit}>
      <section>
        <h2 className="text-lg font-black text-ink">Product Identity</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <TextInput
            error={errors.name}
            id="product-name"
            label="Name"
            name="name"
            onChange={onChange}
            required
            value={values.name}
          />
          <Select
            error={errors.category}
            id="product-category"
            label="Category"
            name="category"
            onChange={onChange}
            options={[{ label: "Select category", value: "" }, ...categoryOptions]}
            required
            value={values.category}
          />
          <TextInput
            error={errors.brand}
            id="product-brand"
            label="Brand"
            maxLength={100}
            name="brand"
            onChange={onChange}
            value={values.brand}
          />
          {/* "Selling Unit", not "Unit": every price below is per one of
              these (a bag, a bottle), not per kilogram. How much a pack
              holds is the separate field beside it. */}
          <div>
            <label className="form-label" htmlFor="product-unit">
              {t("Selling Unit")} <span className="text-red-700">*</span>
            </label>
            <select
              aria-describedby={errors.unit ? "product-unit-error" : hasPackSize ? "product-unit-note" : undefined}
              aria-invalid={Boolean(errors.unit)}
              className="form-field"
              id="product-unit"
              name="unit"
              onChange={onChange}
              required
              value={values.unit}
            >
              {unitGroups.map((group) => (
                <optgroup key={group.label} label={t(group.label)}>
                  {group.units.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(PRODUCT_UNIT_LABELS[unit] || unit)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.unit ? (
              <p className="form-error" id="product-unit-error">
                {t(errors.unit)}
              </p>
            ) : hasPackSize && !MEASURE_UNITS.includes(values.unit) ? (
              <p className="mt-1 text-xs font-semibold text-muted" id="product-unit-note">
                Prices below are per {PRODUCT_UNIT_LABELS[values.unit] || values.unit} ({formatPackSize(values.packSize)}).
              </p>
            ) : null}
          </div>
          <div>
            <label className="form-label" htmlFor="product-pack-size">
              Weight / Pack Size
            </label>
            <div className="flex gap-2">
              <input
                aria-describedby={errors["packSize.value"] ? "product-pack-size-error" : undefined}
                aria-invalid={Boolean(errors["packSize.value"])}
                className="form-field min-w-0 flex-1"
                id="product-pack-size"
                min="0"
                name="packSize.value"
                onChange={handlePackSizeChange}
                placeholder="e.g. 50"
                step="any"
                type="number"
                value={values.packSize?.value ?? ""}
              />
              <select
                aria-label="Pack size unit"
                className="form-field w-28 shrink-0"
                name="packSize.unit"
                onChange={onChange}
                value={values.packSize?.unit ?? ""}
              >
                {packSizeUnitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors["packSize.value"] ? (
              <p className="form-error" id="product-pack-size-error">
                {errors["packSize.value"]}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Descriptions</h2>
        <div className="mt-4 grid gap-5">
          <Textarea
            error={errors.shortDescription}
            id="product-short-description"
            label="Short Description"
            maxLength={300}
            name="shortDescription"
            onChange={onChange}
            value={values.shortDescription}
          />
          <Textarea
            error={errors.description}
            id="product-description"
            label="Description"
            maxLength={3000}
            name="description"
            onChange={onChange}
            value={values.description}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Price by kind of buyer</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          What this product costs each kind of buyer. Leave a box empty and that buyer pays the selling price
          below — so a product nobody has set special rates for behaves exactly as it always has.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {LEAD_TYPE_OPTIONS.map((option) => (
            <TextInput
              error={errors[`leadTypePrices.${option.value}`]}
              id={`product-price-${option.value.toLowerCase()}`}
              key={option.value}
              label={option.label}
              min="0"
              name={`leadTypePrices.${option.value}`}
              onChange={onChange}
              placeholder="Same as selling price"
              step="0.01"
              type="number"
              value={values.leadTypePrices?.[option.value] ?? ""}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Pricing And Reorder Policy</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <TextInput
            error={errors.mrp}
            id="product-mrp"
            label="MRP"
            min="0"
            name="mrp"
            onChange={onChange}
            placeholder="Printed on the pack"
            step="0.01"
            type="number"
            value={values.mrp ?? ""}
          />
          <TextInput
            error={errors.sellingPrice}
            id="product-selling-price"
            label="Selling Price"
            min="0"
            name="sellingPrice"
            onChange={onChange}
            required
            step="0.01"
            type="number"
            value={values.sellingPrice}
          />
          <TextInput
            error={errors.taxRate}
            id="product-tax-rate"
            label="Tax Rate"
            max="100"
            min="0"
            name="taxRate"
            onChange={onChange}
            step="0.01"
            type="number"
            value={values.taxRate}
          />
          <TextInput
            error={errors.minimumStock}
            id="product-minimum-stock"
            label="Minimum Stock"
            min="0"
            name="minimumStock"
            onChange={onChange}
            type="number"
            value={values.minimumStock}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Images And Specifications</h2>
        <div className="mt-4 grid gap-5">
          <ProductImagesField error={errors.images} name="images" onChange={onChange} value={values.images} />
          <Textarea
            error={errors.specificationsText}
            id="product-specifications"
            label="Specifications"
            name="specificationsText"
            onChange={onChange}
            placeholder="One key-value pair per line, for example: Pack Size: 25 kg"
            value={values.specificationsText}
          />
        </div>
      </section>

      <p className="rounded-lg border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold text-muted">
        Product forms do not initialize or edit stock. Opening stock and stock movements belong to
        inventory actions.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button to={ROUTES.SUPER_ADMIN.PRODUCTS} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
