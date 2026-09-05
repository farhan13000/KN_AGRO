import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { getApiErrorMessage } from "../../../core/api";
import { useReportRequestActions } from "../hooks";

// One dialog for both decisions — reviewComment optional on accept,
// rejectionReason REQUIRED on reject, per reviewReportSchema/
// rejectReportSchema.
export default function ReportDecisionDialog({ decision, isOpen, onClose, onSuccess, reportRequest }) {
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const { rejectReport, reviewReport } = useReportRequestActions();
  const isReject = decision === "reject";
  const mutation = isReject ? rejectReport : reviewReport;

  const resetAndClose = () => {
    setComment("");
    setFormError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (isReject && !comment.trim()) {
      setFormError("A reason is required when rejecting a report.");
      return;
    }

    try {
      await mutation.mutate(reportRequest._id, comment.trim() || undefined);
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isReject ? "Reject Report" : "Review Report"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea
          id="report-decision-comment"
          label={isReject ? "Rejection Reason" : "Comment"}
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
