import Button from "../../../shared/components/Button";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";

export default function InventoryMovementForm({
  errors = {},
  isSubmitting = false,
  onCancel,
  onChange,
  onSubmit,
  submitLabel = "Save Movement",
  values,
  warning,
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <TextInput
        error={errors.quantity}
        id="inventory-movement-quantity"
        label="Quantity"
        min="0.01"
        name="quantity"
        onChange={onChange}
        required
        step="0.01"
        type="number"
        value={values.quantity}
      />
      {warning ? (
        <p className="rounded-lg border border-mustard/50 bg-mustard/15 px-4 py-3 text-sm font-semibold text-ink">
          {warning}
        </p>
      ) : null}
      <Textarea
        error={errors.reason}
        id="inventory-movement-reason"
        label="Reason"
        maxLength={300}
        name="reason"
        onChange={onChange}
        required
        value={values.reason}
      />
      <Textarea
        error={errors.remarks}
        id="inventory-movement-remarks"
        label="Remarks"
        maxLength={1000}
        name="remarks"
        onChange={onChange}
        value={values.remarks}
      />
      <p className="rounded-lg border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold text-muted">
        The frontend submits movement details only. Previous stock, new stock, reserved stock, transaction code,
        and performer are calculated by the backend ledger.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
