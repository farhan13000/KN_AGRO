import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { usePromotionActions } from "../hooks";

/**
 * Approve or reject one promotion. The comment is optional when
 * approving but REQUIRED when rejecting, matching the backend's
 * rejectPromotionSchema (min 1 char) — validated here so the user gets
 * the message before a round-trip, and again by the server regardless.
 *
 * Holding PROMOTION_APPROVE/REJECT company-wide doesn't mean this
 * particular promotion is yours to decide: the backend also requires the
 * configured approver tier for this exact role pair AND that you manage
 * the employee. That 403 renders inline here.
 */
export default function PromotionDecisionDialog({ decision, isOpen, onClose, onSuccess, promotion }) {
  const [comment, setComment] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  const isReject = decision === "reject";
  const actions = usePromotionActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setFieldError("");
      setFormError("");
    }
  }, [isOpen, decision]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (isReject && !comment.trim()) {
      setFieldError("A comment is required when rejecting.");
      return;
    }
    setFieldError("");

    try {
      const mutate = isReject ? actions.rejectPromotion.mutate : actions.approvePromotion.mutate;
      await mutate(promotion._id, comment.trim());
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const isBusy = actions.approvePromotion.isLoading || actions.rejectPromotion.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReject ? "Reject promotion" : "Approve promotion"}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          {promotion?.employee?.user?.name || promotion?.employee?.employeeCode || "This employee"}:{" "}
          {promotion?.currentRole?.name?.toUpperCase() || "—"} →{" "}
          {promotion?.proposedRole?.name?.toUpperCase() || "—"}
          {isReject ? null : " — approving completes the role change immediately."}
        </p>

        <Textarea
          error={fieldError}
          id="promotion-decision-comment"
          label={isReject ? "Comment (required)" : "Comment (optional)"}
          maxLength={1000}
          name="comment"
          onChange={(event) => setComment(event.target.value)}
          required={isReject}
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
            className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
              isReject ? "bg-red-700 hover:bg-red-800" : "bg-forest hover:bg-agriculture"
            }`}
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? "Saving..." : isReject ? "Reject Promotion" : "Approve Promotion"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
