import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { getApiErrorMessage } from "../../../core/api";
import { useReportRequestActions } from "../hooks";

// One dialog for both submit (first time) and resubmit (after REJECTED)
// — identical body shape per submitReportSchema/resubmitReportSchema.
// The attachment is a single optional {name, url} pair — this codebase
// has no file-upload integration anywhere (attachments are metadata for
// an ALREADY-hosted file, per reportAttachmentSchema's own design), so
// this is a URL field, not a file picker; a real Google Drive/SharePoint
// link is exactly what the backend's schema expects.
export default function ReportSubmitDialog({ isOpen, isResubmit = false, onClose, onSuccess, reportRequest }) {
  const [submissionText, setSubmissionText] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [formError, setFormError] = useState("");
  const { resubmitReport, submitReport } = useReportRequestActions();
  const mutation = isResubmit ? resubmitReport : submitReport;

  const resetAndClose = () => {
    setSubmissionText("");
    setAttachmentName("");
    setAttachmentUrl("");
    setFormError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!submissionText.trim()) {
      setFormError("Submission text is required.");
      return;
    }

    const payload = { submissionText: submissionText.trim() };
    if (attachmentUrl.trim()) {
      payload.attachments = [{ name: attachmentName.trim() || undefined, url: attachmentUrl.trim() }];
    }

    try {
      await mutation.mutate(reportRequest._id, payload);
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isResubmit ? "Resubmit Report" : "Submit Report"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isResubmit && reportRequest?.rejectionReason ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <span className="font-black uppercase tracking-wide">Rejected — </span>
            {reportRequest.rejectionReason}
          </p>
        ) : null}
        <Textarea
          id="report-submission-text"
          label="Report"
          onChange={(event) => setSubmissionText(event.target.value)}
          required
          value={submissionText}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="report-attachment-name"
            label="Attachment Name (optional)"
            onChange={(event) => setAttachmentName(event.target.value)}
            value={attachmentName}
          />
          <TextInput
            id="report-attachment-url"
            label="Attachment URL (optional)"
            onChange={(event) => setAttachmentUrl(event.target.value)}
            placeholder="https://..."
            type="url"
            value={attachmentUrl}
          />
        </div>
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={mutation.isLoading} type="submit">
            {mutation.isLoading ? "Submitting..." : isResubmit ? "Resubmit" : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
