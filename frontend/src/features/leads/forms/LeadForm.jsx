import Button from "../../../shared/components/Button";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
} from "../constants";

export const initialLeadFormValues = {
  name: "",
  companyName: "",
  phone: "",
  email: "",
  location: "",
  source: "MANUAL",
  interestedProducts: [],
  productQuantities: {},
  message: "",
  priority: "MEDIUM",
  expectedValue: "",
};

const hasAtMostTwoDecimals = (value) => /^\d+(\.\d{1,2})?$/.test(String(value || "").trim());

export const validateLeadForm = (values) => {
  const errors = {};
  if (!values.name?.trim() || values.name.trim().length < 2) {
    errors.name = "Lead name must be at least 2 characters.";
  }
  if (!values.phone && !values.email) {
    errors.phone = "Enter a phone number or email address.";
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.expectedValue && (!hasAtMostTwoDecimals(values.expectedValue) || Number(values.expectedValue) < 0)) {
    errors.expectedValue = "Expected value must be 0 or greater with at most 2 decimal places.";
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};

const sourceOptions = LEAD_SOURCES.map((source) => ({
  label: LEAD_SOURCE_LABELS[source],
  value: source,
}));

const priorityOptions = LEAD_PRIORITIES.map((priority) => ({
  label: LEAD_PRIORITY_LABELS[priority],
  value: priority,
}));

export default function LeadForm({
  cancelTo,
  errors = {},
  isSubmitting = false,
  onChange,
  onProductChange,
  onQuantityChange,
  onSubmit,
  productOptions = [],
  submitLabel = "Save Lead",
  values,
}) {
  return (
    <form className="space-y-7" onSubmit={onSubmit}>
      <section>
        <h2 className="text-lg font-black text-ink">Lead Contact</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <TextInput
            error={errors.name}
            id="lead-name"
            label="Name"
            name="name"
            onChange={onChange}
            required
            value={values.name}
          />
          <TextInput
            error={errors.companyName}
            id="lead-company"
            label="Company / Business Name"
            name="companyName"
            onChange={onChange}
            value={values.companyName}
          />
          <TextInput
            error={errors.phone}
            id="lead-phone"
            label="Phone"
            name="phone"
            onChange={onChange}
            value={values.phone}
          />
          <TextInput
            error={errors.email}
            id="lead-email"
            label="Email"
            name="email"
            onChange={onChange}
            type="email"
            value={values.email}
          />
          <TextInput
            error={errors.location}
            id="lead-location"
            label="Location"
            name="location"
            onChange={onChange}
            value={values.location}
          />
          <Select
            error={errors.source}
            id="lead-source"
            label="Source"
            name="source"
            onChange={onChange}
            options={sourceOptions}
            required
            value={values.source}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">CRM Intake</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Select
            error={errors.priority}
            id="lead-priority"
            label="Priority"
            name="priority"
            onChange={onChange}
            options={priorityOptions}
            value={values.priority}
          />
          <div>
            <TextInput
              error={errors.expectedValue}
              id="lead-expected-value"
              label="Expected / Pipeline Value"
              min="0"
              name="expectedValue"
              onChange={onChange}
              step="0.01"
              type="number"
              value={values.expectedValue}
            />
            <span className="mt-1 block text-xs font-semibold text-muted">
              {values.interestedProducts?.length
                ? `Worked out from ${values.interestedProducts.length} selected product${
                    values.interestedProducts.length > 1 ? "s" : ""
                  } at catalogue price, including tax. Change it if you need to.`
                : "Pick the interested products below and this fills in from the catalogue price, with tax."}
            </span>
          </div>
          <label className="sm:col-span-2">
            <span className="form-label">Interested Products</span>
            <select
              className="form-field min-h-32"
              id="lead-interested-products"
              multiple
              name="interestedProducts"
              onChange={onProductChange}
              value={values.interestedProducts}
            >
              {productOptions.map((product) => (
                <option key={product.value} value={product.value}>
                  {product.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-semibold text-muted">
              Use Ctrl or Shift to select multiple products.
            </span>
          </label>

          {/* Quantity is optional throughout: a lead often records only
              WHAT was asked about, and how much is settled on the
              quotation. A blank box counts as one unit for the estimate
              and is not sent as a quantity the customer never gave. */}
          {values.interestedProducts?.length ? (
            <div className="sm:col-span-2">
              <span className="form-label">Quantity per product (optional)</span>
              <div className="mt-2 space-y-2 rounded-lg border border-forest/10 bg-white p-3">
                {values.interestedProducts.map((productId) => {
                  const option = productOptions.find((item) => String(item.value) === String(productId));
                  return (
                    <div className="flex flex-wrap items-center gap-3" key={productId}>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                        {option?.label || productId}
                      </span>
                      <input
                        aria-label={`Quantity for ${option?.label || productId}`}
                        className="form-field w-32"
                        min="0"
                        name={`quantity-${productId}`}
                        onChange={(event) => onQuantityChange?.(productId, event.target.value)}
                        placeholder={option?.unit || "Qty"}
                        step="any"
                        type="number"
                        value={values.productQuantities?.[String(productId)] ?? ""}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <Textarea
              error={errors.message}
              id="lead-message"
              label="Message"
              maxLength={2000}
              name="message"
              onChange={onChange}
              value={values.message}
            />
          </div>
        </div>
      </section>

      <p className="rounded-lg border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold text-muted">
        The lead code, its status and its history are kept automatically — you do not need to fill them in.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {cancelTo ? (
          <Button to={cancelTo} variant="secondary">
            Cancel
          </Button>
        ) : null}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
