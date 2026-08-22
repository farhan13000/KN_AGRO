import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import { RejectionReasonField } from "../forms";
import { useEmployeeActions } from "../hooks";
import { validateRejectionForm } from "../schemas";
import { getEmployeeDisplayName } from "../utils";

export default function EmployeeRejectionDialog({ employee, isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState({ rejectionReason: "" });
  const [errors, setErrors] = useState({});
  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setValues({ rejectionReason: "" });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateRejectionForm(values);
    setErrors(validation.errors);

    if (!validation.isValid || !employee?._id) return;

    await actions.rejectEmployee.mutate(employee._id, values);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reject ${getEmployeeDisplayName(employee)}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <RejectionReasonField
          error={errors.rejectionReason}
          onChange={(event) => setValues({ rejectionReason: event.target.value })}
          value={values.rejectionReason}
        />

        {actions.rejectEmployee.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {actions.rejectEmployee.errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:opacity-60"
            disabled={actions.rejectEmployee.isLoading}
            type="submit"
          >
            {actions.rejectEmployee.isLoading ? "Rejecting..." : "Reject Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
