import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { useDSRActions } from "../hooks";

/**
 * Review (SUBMITTED -> REVIEWED). Comment is optional per the backend's
 * reviewDSRSchema. Acknowledge needs no dialog of its own — the backend
 * accepts no body for it — so it's driven by the shared ConfirmDialog
 * directly from the list view instead of a bespoke component here.
 *
 * The backend's own canManageEmployee-based 403 (and the "you may not
 * review your own DSR" / "the same manager who reviewed this cannot also
 * acknowledge it" rules) are the real authority — this dialog never
 * pre-computes whether the actor is actually in this employee's chain.
 */
export default function DSRReviewDialog({ dsr, isOpen, onClose, onSuccess }) {
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const actions = useDSRActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setFormError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      await actions.reviewDSR.mutate(dsr._id, comment.trim());
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review DSR">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          {dsr?.employee?.user?.name || dsr?.employee?.employeeCode || "This employee"}'s DSR will move to
          REVIEWED.
        </p>

        <Textarea
          id="dsr-review-comment"
          label="Comment (optional)"
          maxLength={1000}
          name="comment"
          onChange={(event) => setComment(event.target.value)}
          value={comment}
        />

        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {formError}
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
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
            disabled={actions.reviewDSR.isLoading}
            type="submit"
          >
            {actions.reviewDSR.isLoading ? "Saving..." : "Mark Reviewed"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
