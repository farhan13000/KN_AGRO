import Button from "../../../shared/components/Button";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { getBusinessDateKey } from "../../../shared/utils";
import { PAYMENT_METHOD, PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "../constants";

const methodOptions = PAYMENT_METHODS.map((method) => ({ label: PAYMENT_METHOD_LABELS[method], value: method }));

// Prompt 45: the transactionReference label adapts to the selected method
// — still the exact same backend field (`transactionReference`) either
// way, this is display-only phrasing, never a different field name.
const referenceLabelFor = (method) => {
  if (method === PAYMENT_METHOD.UPI) return "UPI Reference / UTR";
  if (method === PAYMENT_METHOD.BANK_TRANSFER) return "Bank Transfer / UTR";
  if (method === PAYMENT_METHOD.CHEQUE) return "Cheque Number";
  return "Reference";
};

export default function RecordPaymentForm({
  errors = {},
  isSubmitting = false,
  onCancel,
  onChange,
  onSubmit,
  values,
  warning = "",
}) {
  const setField = (field) => (event) => onChange(field, event.target.value);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <TextInput
        error={errors.amount}
        id="payment-amount"
        label="Amount"
        min="0.01"
        onChange={setField("amount")}
        required
        step="0.01"
        type="number"
        value={values.amount}
      />
      {warning ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {warning}
        </p>
      ) : null}
      <Select
        error={errors.method}
        id="payment-method"
        label="Method"
        onChange={setField("method")}
        options={methodOptions}
        required
        value={values.method}
      />
      <TextInput
        error={errors.transactionReference}
        id="payment-reference"
        label={referenceLabelFor(values.method)}
        maxLength={200}
        onChange={setField("transactionReference")}
        value={values.transactionReference}
      />
      <TextInput
        id="payment-date"
        label="Payment Date"
        max={getBusinessDateKey(new Date())}
        onChange={setField("paymentDate")}
        type="date"
        value={values.paymentDate}
      />
      <Textarea
        error={errors.notes}
        id="payment-notes"
        label="Notes"
        maxLength={1000}
        onChange={setField("notes")}
        value={values.notes}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} type="button" variant="secondary">
          Back
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
