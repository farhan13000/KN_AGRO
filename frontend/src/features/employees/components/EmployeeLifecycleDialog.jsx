import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import { useEmployeeActions } from "../hooks";
import { getEmployeeDisplayName } from "../utils";

const actionConfig = {
  deactivate: {
    title: "Deactivate employee",
    confirmLabel: "Deactivate",
    description: "This will ask the backend to deactivate the employee record. The employee is not deleted.",
    tone: "danger",
  },
  reactivate: {
    title: "Reactivate employee",
    confirmLabel: "Reactivate",
    description: "This will ask the backend to reactivate this inactive employee.",
    tone: "success",
  },
  resign: {
    title: "Mark as resigned",
    confirmLabel: "Confirm Resignation",
    description: "This will ask the backend to mark this employee as resigned.",
    tone: "danger",
  },
  terminate: {
    title: "Terminate employee",
    confirmLabel: "Terminate",
    description: "This is a high-risk lifecycle action. The backend controls final status and account policy.",
    tone: "danger",
  },
  promote: {
    title: "Promote to Sales Manager",
    confirmLabel: "Promote",
    description:
      "This will ask the backend to change the linked user role to Sales Manager. No separate manager entity is created.",
    tone: "success",
  },
};

const getMutation = (actions, action) => {
  if (action === "deactivate") return actions.deactivateEmployee;
  if (action === "reactivate") return actions.reactivateEmployee;
  if (action === "resign") return actions.resignEmployee;
  if (action === "terminate") return actions.terminateEmployee;
  if (action === "promote") return actions.promoteToManager;
  return null;
};

export default function EmployeeLifecycleDialog({
  action,
  employee,
  isOpen,
  onClose,
  onSuccess,
  salesManagerRoleId = "",
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });
  const config = actionConfig[action] || actionConfig.deactivate;
  const mutation = getMutation(actions, action);
  const isPromotionBlocked = action === "promote" && !salesManagerRoleId;
  const requiresTypedConfirmation = action === "terminate";
  const isTypedConfirmationValid = !requiresTypedConfirmation || confirmationText === "TERMINATE";

  useEffect(() => {
    if (isOpen) {
      setConfirmationText("");
    }
  }, [isOpen, action]);

  const handleConfirm = async () => {
    if (!employee?._id || !mutation || isPromotionBlocked || !isTypedConfirmationValid) return;

    if (action === "promote") {
      await mutation.mutate(employee._id, salesManagerRoleId);
    } else {
      await mutation.mutate(employee._id);
    }

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

        {isPromotionBlocked ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            Promotion requires `VITE_SALES_MANAGER_ROLE_ID` because the backend promote endpoint accepts a roleId
            and no roles listing endpoint is exposed.
          </p>
        ) : null}

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
            disabled={mutation?.isLoading || isPromotionBlocked || !isTypedConfirmationValid}
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
