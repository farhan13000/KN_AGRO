import { useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import Icon from "../../../shared/components/Icon";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { ROUTES } from "../../../shared/constants";
import { PRODUCT_UNIT_LABELS } from "../constants";

const unitOptions = Object.entries(PRODUCT_UNIT_LABELS).map(([value, label]) => ({ label, value }));

const getPreviewUrls = (value) =>
  String(value || "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    })
    .slice(0, 3);

function ImageUrlPreview({ imagesText, productName }) {
  const [brokenUrls, setBrokenUrls] = useState(() => new Set());
  const urls = useMemo(() => getPreviewUrls(imagesText), [imagesText]);

  if (!urls.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {urls.map((url) => {
        const isBroken = brokenUrls.has(url);
        return (
          <div
            className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-forest/10 bg-mint"
            key={url}
          >
            {isBroken ? (
              <div className="flex flex-col items-center gap-2 text-center text-forest">
                <Icon name="PackageCheck" className="h-7 w-7" />
                <span className="text-xs font-bold">Preview unavailable</span>
              </div>
            ) : (
              <img
                alt={`${productName || "Product"} preview`}
                className="h-full w-full object-contain p-2"
                loading="lazy"
                onError={() => setBrokenUrls((current) => new Set([...current, url]))}
                src={url}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProductForm({
  categoryOptions = [],
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Save Product",
  values,
}) {
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
          <Select
            error={errors.unit}
            id="product-unit"
            label="Unit"
            name="unit"
            onChange={onChange}
            options={unitOptions}
            required
            value={values.unit}
          />
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
        <h2 className="text-lg font-black text-ink">Pricing And Reorder Policy</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-4">
          <TextInput
            error={errors.purchasePrice}
            id="product-purchase-price"
            label="Purchase Price"
            min="0"
            name="purchasePrice"
            onChange={onChange}
            required
            step="0.01"
            type="number"
            value={values.purchasePrice}
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
          <Textarea
            error={errors.imagesText}
            id="product-images"
            label="Image URLs"
            name="imagesText"
            onChange={onChange}
            placeholder="One hosted image URL per line"
            value={values.imagesText}
          />
          <ImageUrlPreview imagesText={values.imagesText} productName={values.name} />
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
