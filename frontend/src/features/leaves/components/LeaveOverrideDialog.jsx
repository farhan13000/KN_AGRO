import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { getApiErrorMessage } from "../../../core/api";
import {
  LEAVE_OVERRIDE_ACTION,
  LEAVE_OVERRIDE_ACTION_LABELS,
  LEAVE_TYPE,
  LEAVE_TYPE_LABELS,
} from "../constants";
import { useLeaveActions } from "../hooks";

const toDateInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

/**
 * Administrator override — the deliberate way around the normal
 * manager-only workflow, for an Office Admin or Super Admin.
 *
 * The reason is required and the submit stays disabled without one.
 * That is not defensive validation for its own sake: an override with
 * no recorded justification cannot be told apart from a mistake when
 * someone reads the audit trail back later, so the UI refuses to let
 * one happen by accident.
 */
export default function LeaveOverrideDialog({ isOpen, leave, onClose, onSuccess }) {
  const [action, setAction] = useState(LEAVE_OVERRIDE_ACTION.APPROVE);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [formError, setFormError] = useState("");
  const { amendLeave, overrideLeave } = useLeaveActions();

  const isAmend = action === LEAVE_OVERRIDE_ACTION.AMEND;
  const mutation = isAmend ? amendLeave : overrideLeave;

  const resetAndClose = () => {
    setAction(LEAVE_OVERRIDE_ACTION.APPROVE);
    setReason("");
    setStartDate("");
    setEndDate("");
    setLeaveType("");
    setFormError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setFormError("A reason is required for an administrator override.");
      return;
    }

    try {
      if (isAmend) {
        const payload = { reason: trimmedReason };
        if (startDate) payload.startDate = startDate;
        if (endDate) payload.endDate = endDate;
        if (leaveType) payload.leaveType = leaveType;

        if (!startDate && !endDate && !leaveType) {
          setFormError("Change at least one of the dates or the leave type.");
          return;
        }
        await mutation.mutate(leave._id, payload);
      } else {
        await mutation.mutate(leave._id, { action, reason: trimmedReason });
      }
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Administrator Override">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
          This acts outside the employee&apos;s own manager. It is recorded against your name with the reason you
          give, and both the employee and their manager are told.
        </p>

        <Select
          id="leave-override-action"
          label="Action"
          onChange={(event) => setAction(event.target.value)}
          options={Object.values(LEAVE_OVERRIDE_ACTION).map((value) => ({
            value,
            label: LEAVE_OVERRIDE_ACTION_LABELS[value],
          }))}
          value={action}
        />

        {isAmend ? (
          <div className="space-y-4 rounded-lg border border-forest/10 p-3">
            <p className="text-xs font-semibold text-muted">
              Leave a field blank to keep it as it is. Currently {toDateInput(leave?.startDate)} to{" "}
              {toDateInput(leave?.endDate)}, {LEAVE_TYPE_LABELS[leave?.leaveType] || leave?.leaveType}.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                id="leave-override-start"
                label="New start date"
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
              <TextInput
                id="leave-override-end"
                label="New end date"
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                value={endDate}
              />
            </div>
            <Select
              id="leave-override-type"
              label="New leave type"
              onChange={(event) => setLeaveType(event.target.value)}
              options={[
                { value: "", label: "Keep unchanged" },
                ...Object.values(LEAVE_TYPE).map((value) => ({ value, label: LEAVE_TYPE_LABELS[value] })),
              ]}
              value={leaveType}
            />
          </div>
        ) : null}

        <Textarea
          id="leave-override-reason"
          label="Reason (required)"
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
        />

        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={mutation.isLoading || !reason.trim()} type="submit">
            {mutation.isLoading ? "Saving..." : "Confirm override"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
