import AddressForm from "../../../shared/forms/AddressForm";
import Button from "../../../shared/components/Button";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TYPES } from "../constants";

const typeOptions = CUSTOMER_TYPES.map((type) => ({ label: CUSTOMER_TYPE_LABELS[type], value: type }));

// Shared by Create (Prompt 21) and Edit (Prompt 22) — same editable-field
// set either way, matching customer.validation.js's create/update schemas
// (customerCode/status/blockReason/sourceLead/createdBy/updatedBy are
// server-owned and never appear here). Address changes made through this
// form only ever PATCH the live Customer record — they can never reach an
// already-generated Invoice's frozen billingAddressSnapshot/
// shippingAddressSnapshot, since those are separate fields copied once at
// invoice-generation time and never re-read from Customer afterward (see
// PHASE6_FRONTEND_API_CONTRACT.md's Invoice snapshot behavior note).
export default function CustomerForm({
  cancelPath = "",
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Save Customer",
  values,
}) {
  const setField = (field) => (event) => onChange(field, event.target.value);

  return (
    <form className="space-y-7" onSubmit={onSubmit}>
      <section>
        <h2 className="text-lg font-black text-ink">Identity &amp; Contact</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <TextInput
            error={errors.name}
            id="customer-name"
            label="Name"
            maxLength={150}
            onChange={setField("name")}
            required
            value={values.name}
          />
          <TextInput
            error={errors.companyName}
            id="customer-company"
            label="Company Name"
            maxLength={150}
            onChange={setField("companyName")}
            value={values.companyName}
          />
          <Select
            id="customer-type"
            label="Type"
            onChange={setField("type")}
            options={typeOptions}
            value={values.type}
          />
          <TextInput
            error={errors.phone}
            id="customer-phone"
            label="Phone"
            maxLength={20}
            onChange={setField("phone")}
            value={values.phone}
          />
          <TextInput
            error={errors.email}
            id="customer-email"
            label="Email"
            maxLength={200}
            onChange={setField("email")}
            type="email"
            value={values.email}
          />
          <TextInput
            id="customer-location"
            label="Location"
            maxLength={200}
            onChange={setField("location")}
            value={values.location}
          />
        </div>
        <p className="mt-3 text-xs font-semibold text-muted">
          Either phone or email is required — this is how the customer can actually be reached.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Addresses</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <AddressForm
            idPrefix="customer-billing"
            legend="Billing Address"
            onChange={(address) => onChange("billingAddress", address)}
            value={values.billingAddress}
          />
          <AddressForm
            idPrefix="customer-shipping"
            legend="Shipping Address"
            onChange={(address) => onChange("shippingAddress", address)}
            value={values.shippingAddress}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-ink">Tax Information &amp; Payment Terms</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <TextInput
            error={errors.GSTNumber}
            id="customer-gst"
            label="GST Number"
            onChange={setField("GSTNumber")}
            value={values.GSTNumber}
          />
          <TextInput
            error={errors.PANNumber}
            id="customer-pan"
            label="PAN Number"
            onChange={setField("PANNumber")}
            value={values.PANNumber}
          />
          <TextInput
            error={errors.creditLimit}
            id="customer-credit-limit"
            label="Credit Limit"
            min="0"
            onChange={setField("creditLimit")}
            step="0.01"
            type="number"
            value={values.creditLimit}
          />
          <TextInput
            error={errors.paymentTerms}
            id="customer-payment-terms"
            label="Payment Terms"
            maxLength={100}
            onChange={setField("paymentTerms")}
            placeholder="e.g. Net 30"
            value={values.paymentTerms}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {cancelPath ? (
          <Button to={cancelPath} variant="secondary">
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
