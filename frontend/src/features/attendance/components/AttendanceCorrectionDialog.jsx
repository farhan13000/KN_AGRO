import { useEffect, useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { getApiErrorMessage } from "../../../core/api";
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from "../constants";
import { useAttendanceActions } from "../hooks";

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

// checkIn/checkOut/status/remarks are all OPTIONAL on the backend's own
// attendanceCorrectionSchema — only correctionReason is required. Blank
// datetime fields are simply omitted from the payload, leaving that
// field untouched server-side.
export default function AttendanceCorrectionDialog({ isOpen, onClose, onSuccess, record }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [formError, setFormError] = useState("");
  const { correctAttendance } = useAttendanceActions();

  const resetAndClose = () => {
    setCheckIn("");
    setCheckOut("");
    setStatus("");
    setRemarks("");
    setCorrectionReason("");
    setFormError("");
    onClose();
  };

  useEffect(() => {
    if (isOpen && record) {
      setCheckIn(toDateTimeLocal(record.checkIn));
      setCheckOut(toDateTimeLocal(record.checkOut));
      setStatus(record.status || "");
      setRemarks(record.remarks || "");
      setCorrectionReason("");
      setFormError("");
    }
  }, [isOpen, record]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!correctionReason.trim()) {
      setFormError("A correction reason is required.");
      return;
    }

    const payload = { correctionReason: correctionReason.trim() };
    if (checkIn) payload.checkIn = new Date(checkIn).toISOString();
    if (checkOut) payload.checkOut = new Date(checkOut).toISOString();
    if (status) payload.status = status;
    if (remarks.trim()) payload.remarks = remarks.trim();

    try {
      await correctAttendance.mutate(record._id, payload);
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Correct Attendance">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="correction-check-in"
            label="Check-In"
            onChange={(event) => setCheckIn(event.target.value)}
            type="datetime-local"
            value={checkIn}
          />
          <TextInput
            id="correction-check-out"
            label="Check-Out"
            onChange={(event) => setCheckOut(event.target.value)}
            type="datetime-local"
            value={checkOut}
          />
        </div>
        <Select
          id="correction-status"
          label="Status"
          onChange={(event) => setStatus(event.target.value)}
          options={[
            { value: "", label: "No change" },
            ...Object.values(ATTENDANCE_STATUS).map((value) => ({ value, label: ATTENDANCE_STATUS_LABELS[value] })),
          ]}
          value={status}
        />
        <Textarea
          id="correction-remarks"
          label="Remarks"
          onChange={(event) => setRemarks(event.target.value)}
          value={remarks}
        />
        <Textarea
          id="correction-reason"
          label="Correction Reason"
          onChange={(event) => setCorrectionReason(event.target.value)}
          required
          value={correctionReason}
        />
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={correctAttendance.isLoading} type="submit">
            {correctAttendance.isLoading ? "Saving..." : "Save Correction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
