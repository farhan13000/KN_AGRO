import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { formatMoney } from "../../../shared/utils";
import { useSalaryProposalActions } from "../hooks";

/**
 * Review (GM, RECOMMENDED -> REVIEWED) or reject (GM at RECOMMENDED, or SA
 * at REVIEWED -> REJECTED) one proposal. Comment is optional when
 * reviewing but REQUIRED when rejecting, matching the backend's
 * rejectSalaryProposalSchema (min 1 char).
 *
 * Approve and Finalize need no dialog of their own — the backend accepts
 * no body for either — so they're driven by the shared ConfirmDialog
 * directly from SalaryProposalPipelineView instead of a bespoke component
 * here.
 */
export default function SalaryProposalDecisionDialog({ decision, isOpen, onClose, onSuccess, proposal }) {
  const [comment, setComment] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  const isReject = decision === "reject";
  const actions = useSalaryProposalActions({
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
      setFieldError("A reason is required when rejecting.");
      return;
    }
    setFieldError("");

    try {
      const mutate = isReject ? actions.rejectSalaryProposal.mutate : actions.reviewSalaryProposal.mutate;
      await mutate(proposal._id, comment.trim());
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const isBusy = actions.reviewSalaryProposal.isLoading || actions.rejectSalaryProposal.isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isReject ? "Reject salary proposal" : "Review salary proposal"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          {proposal?.employee?.user?.name || proposal?.employee?.employeeCode || "This employee"}:{" "}
          {formatMoney(proposal?.currentSalary)} → {formatMoney(proposal?.proposedSalary)}
        </p>

        <Textarea
          error={fieldError}
          id="salary-proposal-decision-comment"
          label={isReject ? "Reason (required)" : "Comment (optional)"}
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
            {isBusy ? "Saving..." : isReject ? "Reject Proposal" : "Submit Review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
