import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { getApiErrorMessage } from "../../../core/api";
import { useLeaveActions } from "../hooks";

// One dialog for both decisions since they share the same shape — but
// the comment's requiredness genuinely differs: optional on approve,
// required on reject, per approveLeaveSchema/rejectLeaveSchema.
export default function LeaveDecisionDialog({ decision, isOpen, leave, onClose, onSuccess }) {
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const { approveLeave, rejectLeave } = useLeaveActions();
  const isReject = decision === "reject";
  const mutation = isReject ? rejectLeave : approveLeave;

  const resetAndClose = () => {
    setComment("");
    setFormError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (isReject && !comment.trim()) {
      setFormError("A comment is required when rejecting a leave request.");
      return;
    }

    try {
      await mutation.mutate(leave._id, comment.trim() || undefined);
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isReject ? "Reject Leave Request" : "Approve Leave Request"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea
          id="leave-decision-comment"
          label="Comment"
          onChange={(event) => setComment(event.target.value)}
          required={isReject}
          value={comment}
        />
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={mutation.isLoading} type="submit">
            {mutation.isLoading ? "Saving..." : isReject ? "Reject" : "Approve"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
