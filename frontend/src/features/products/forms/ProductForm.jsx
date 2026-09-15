import Button from "../../../shared/components/Button";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { ROUTES } from "../../../shared/constants";
import ProductImagesField from "../components/ProductImagesField";
import { PRODUCT_UNIT_LABELS } from "../constants";

const unitOptions = Object.entries(PRODUCT_UNIT_LABELS).map(([value, label]) => ({ label, value }));

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
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
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
