import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import { useEmployeeActions } from "../hooks";
import { getEmployeeDisplayName } from "../utils";

const actionConfig = {
  deactivate: {
    title: "Deactivate employee",
    confirmLabel: "Deactivate",
    description: "This deactivates the employee. Their record and history are kept, and they can be reactivated later.",
    tone: "danger",
  },
  reactivate: {
    title: "Reactivate employee",
    confirmLabel: "Reactivate",
    description: "This makes the employee active again, so they can sign in and be assigned work.",
    tone: "success",
  },
  resign: {
    title: "Mark as resigned",
    confirmLabel: "Confirm Resignation",
    description: "This marks the employee as resigned. Their record and history are kept.",
    tone: "danger",
  },
  terminate: {
    title: "Terminate employee",
    confirmLabel: "Terminate",
    description: "This changes whether the employee can sign in and be given work. Check you have picked the right person.",
    tone: "danger",
  },
};

const getMutation = (actions, action) => {
  if (action === "deactivate") return actions.deactivateEmployee;
  if (action === "reactivate") return actions.reactivateEmployee;
  if (action === "resign") return actions.resignEmployee;
  if (action === "terminate") return actions.terminateEmployee;
  return null;
};

export default function EmployeeLifecycleDialog({
  action,
  employee,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });
  const config = actionConfig[action] || actionConfig.deactivate;
  const mutation = getMutation(actions, action);
  const requiresTypedConfirmation = action === "terminate";
  const isTypedConfirmationValid = !requiresTypedConfirmation || confirmationText === "TERMINATE";

  useEffect(() => {
    if (isOpen) {
      setConfirmationText("");
    }
  }, [isOpen, action]);

  const handleConfirm = async () => {
    if (!employee?._id || !mutation || !isTypedConfirmationValid) return;

    await mutation.mutate(employee._id);
    onClose();
  };

  const confirmClass =
    config.tone === "danger"
      ? "bg-red-700 text-white hover:bg-red-800"
      : "bg-forest text-white hover:bg-agriculture";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted">
          {config.description} Target employee:{" "}
          <span className="font-black text-ink">{getEmployeeDisplayName(employee)}</span>.
        </p>

        {mutation?.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {mutation.errorMessage}
          </p>
        ) : null}

        {requiresTypedConfirmation ? (
          <div>
            <label className="form-label" htmlFor="terminate-confirmation">
              Type TERMINATE to confirm
            </label>
            <input
              className="form-field"
              id="terminate-confirmation"
              onChange={(event) => setConfirmationText(event.target.value)}
              value={confirmationText}
            />
          </div>
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
            className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold shadow-sm transition disabled:opacity-60 ${confirmClass}`}
            disabled={mutation?.isLoading || !isTypedConfirmationValid}
            onClick={handleConfirm}
            type="button"
          >
            {mutation?.isLoading ? "Working..." : config.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
