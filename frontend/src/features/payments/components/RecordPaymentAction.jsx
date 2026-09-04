import { useState } from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import Modal from "../../../shared/components/Modal";
import RecordPaymentForm from "../forms/RecordPaymentForm";
import { usePaymentActions } from "../hooks";
import { initialRecordPaymentFormValues, validateRecordPaymentForm } from "../schemas";
import { formatPaymentAmount } from "../utils";

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted">{label}</span>
    <span className="font-semibold text-ink">{value}</span>
  </div>
);

// Prompt 46: eligibility (`invoice.status === ISSUED && dueAmount > 0`) is
// decided by the caller via getInvoiceCapabilities — this component
// doesn't re-check it, it just doesn't render if the caller doesn't
// mount it. `onRecorded` is called after a real success so the caller can
// refetch both the Invoice (Prompt 46: "Invoice recalculated") and the
// Payment History list — this component doesn't own either fetch.
//
// Prompt 47 (Overpayment UX): the amount<=dueAmount check in
// validateRecordPaymentForm is advisory only (a warning, never blocks
// submit) — the backend's own atomic check is what's actually
// authoritative. On a real conflict (409), the backend's own message is
// shown via ActionError-equivalent below and the invoice is refetched
// through `onRecorded` being called from the mutation's `onError` too —
// the entered amount is never silently rewritten.
export default function RecordPaymentAction({ invoice, onRecorded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState(initialRecordPaymentFormValues);
  const [errors, setErrors] = useState({});
  const [warning, setWarning] = useState("");

  const dueAmount = invoice.paymentSummary?.dueAmount ?? 0;

  const closeDialog = () => {
    setIsOpen(false);
    setValues(initialRecordPaymentFormValues);
    setErrors({});
    setWarning("");
  };

  const recordPayment = usePaymentActions({
    onError: async () => {
      await onRecorded?.();
    },
    onSuccess: async () => {
      closeDialog();
      await onRecorded?.();
    },
  }).recordPayment;

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateRecordPaymentForm(values, { dueAmount });
    setErrors(validation.errors);
    setWarning(validation.warning);
    if (!validation.isValid) return;

    recordPayment.mutate(invoice._id, values).catch(() => {});
  };

  return (
    <>
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Record Payment</h2>
        <div className="mt-4 divide-y divide-forest/10">
          <SummaryRow label="Grand Total" value={formatPaymentAmount(invoice.grandTotal)} />
          <SummaryRow label="Already Paid" value={formatPaymentAmount(invoice.paymentSummary?.paidAmount)} />
          <SummaryRow label="Outstanding" value={formatPaymentAmount(dueAmount)} />
        </div>
        <Button className="mt-4 w-full justify-center rounded-lg" onClick={() => setIsOpen(true)}>
          Record Payment
        </Button>
      </Card>

      <Modal isOpen={isOpen} onClose={closeDialog} title="Record payment">
        {recordPayment.errorMessage ? (
          <p
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
            role="alert"
          >
            {recordPayment.errorMessage}
          </p>
        ) : null}
        <RecordPaymentForm
          errors={errors}
          isSubmitting={recordPayment.isLoading}
          onCancel={closeDialog}
          onChange={handleChange}
          onSubmit={handleSubmit}
          values={values}
          warning={warning}
        />
      </Modal>
    </>
  );
}
