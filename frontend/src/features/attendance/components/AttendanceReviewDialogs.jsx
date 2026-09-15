import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { getApiErrorMessage } from "../../../core/api";
import { formatBusinessDateTime } from "../../../shared/utils";
import { ATTENDANCE_STATUS } from "../constants";
import { useAttendanceActions } from "../hooks";

const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint";

/**
 * The employee's side: "please look at this half day again", with a
 * message explaining why (a client visit, a vehicle breakdown). Goes to
 * their manager, who decides.
 */
export function AttendanceReviewRequestDialog({ isOpen, onClose, onSuccess, record }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { requestReview } = useAttendanceActions();

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      setError("Write a short message for your manager.");
      return;
    }
    try {
      await requestReview.mutate(record._id, message.trim());
      await onSuccess?.();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Discuss this attendance with your manager">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm leading-6 text-muted">
          This day is counted as a half day. Tell your manager why — they can change it to a full day or keep it as
          a half day, and you will see their decision here.
        </p>
        <Textarea
          id="attendance-review-message"
          label="Message to your manager"
          maxLength={1000}
          onChange={(event) => setMessage(event.target.value)}
          required
          value={message}
        />
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <button className={secondaryButton} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={primaryButton} disabled={requestReview.isLoading} type="submit">
            {requestReview.isLoading ? "Sending…" : "Send to manager"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * The manager's side: read the request, then full day or half day, with
 * an optional note the employee will see.
 */
export function AttendanceReviewDecisionDialog({ isOpen, onClose, onSuccess, record }) {
  const [decision, setDecision] = useState(ATTENDANCE_STATUS.PRESENT);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const { resolveReview } = useAttendanceActions();

  useEffect(() => {
    if (isOpen) {
      setDecision(ATTENDANCE_STATUS.PRESENT);
      setNote("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await resolveReview.mutate(record._id, { decision, note: note.trim() || undefined });
      await onSuccess?.();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  const option = (value, label, hint) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
        decision === value ? "border-forest bg-mint/40" : "border-forest/15 bg-white"
      }`}
    >
      <input
        checked={decision === value}
        className="mt-1"
        name="review-decision"
        onChange={() => setDecision(value)}
        type="radio"
        value={value}
      />
      <span>
        <span className="block text-sm font-black text-ink">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review attendance request">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {record?.review ? (
          <div className="rounded-lg border border-forest/10 bg-mint/30 p-3 text-sm">
            <p className="text-xs font-bold text-muted">
              {record.date ? formatBusinessDateTime(record.date).split(",")[0] : ""} · requested{" "}
              {record.review.requestedAt ? formatBusinessDateTime(record.review.requestedAt) : ""}
            </p>
            <p className="mt-1 whitespace-pre-line text-ink">“{record.review.message}”</p>
          </div>
        ) : null}

        <div className="grid gap-2">
          {option(ATTENDANCE_STATUS.PRESENT, "Full day", "Count this day as present.")}
          {option(ATTENDANCE_STATUS.HALF_DAY, "Keep half day", "Leave it as a half day.")}
        </div>

        <Textarea
          id="attendance-review-note"
          label="Note for the employee (optional)"
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <button className={secondaryButton} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={primaryButton} disabled={resolveReview.isLoading} type="submit">
            {resolveReview.isLoading ? "Saving…" : "Save decision"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
