import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { getApiErrorMessage } from "../../../core/api";
import { useLeaveActions } from "../hooks";

// cancellationReason is REQUIRED per the backend's own cancelLeaveSchema
// — a bare confirm button would silently fail, so this needs a real
// dialog, not a ConfirmDialog with no input.
export default function LeaveCancelDialog({ isOpen, leave, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const { cancelLeave } = useLeaveActions();

  const resetAndClose = () => {
    setReason("");
    setFormError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!reason.trim()) {
      setFormError("A cancellation reason is required.");
      return;
    }

    try {
      await cancelLeave.mutate(leave._id, reason.trim());
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Cancel Leave Request">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-muted">This will cancel your pending leave request. This cannot be undone.</p>
        <Textarea
          id="leave-cancellation-reason"
          label="Cancellation Reason"
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
        />
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Keep Request
          </Button>
          <Button disabled={cancelLeave.isLoading} type="submit">
            {cancelLeave.isLoading ? "Cancelling..." : "Cancel Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
