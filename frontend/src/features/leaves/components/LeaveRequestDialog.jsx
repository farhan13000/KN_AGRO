import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { getApiErrorMessage } from "../../../core/api";
import { LEAVE_TYPE, LEAVE_TYPE_LABELS } from "../constants";
import { useLeaveActions } from "../hooks";

const emptyForm = { leaveType: LEAVE_TYPE.CASUAL, startDate: "", endDate: "", reason: "" };

export default function LeaveRequestDialog({ isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const { createLeave } = useLeaveActions();

  const resetAndClose = () => {
    setValues(emptyForm);
    setFormError("");
    onClose();
  };

  const handleChange = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!values.startDate || !values.endDate) {
      setFormError("Start date and end date are both required.");
      return;
    }
    if (new Date(values.endDate) < new Date(values.startDate)) {
      setFormError("End date cannot be before start date.");
      return;
    }
    if (!values.reason.trim()) {
      setFormError("A reason is required.");
      return;
    }

    try {
      await createLeave.mutate({
        leaveType: values.leaveType,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim(),
      });
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Request Leave">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          id="leave-type"
          label="Leave Type"
          onChange={handleChange("leaveType")}
          options={Object.values(LEAVE_TYPE).map((value) => ({ value, label: LEAVE_TYPE_LABELS[value] }))}
          required
          value={values.leaveType}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="leave-start-date"
            label="Start Date"
            onChange={handleChange("startDate")}
            required
            type="date"
            value={values.startDate}
          />
          <TextInput
            id="leave-end-date"
            label="End Date"
            onChange={handleChange("endDate")}
            required
            type="date"
            value={values.endDate}
          />
        </div>
        <Textarea id="leave-reason" label="Reason" onChange={handleChange("reason")} required value={values.reason} />
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={createLeave.isLoading} type="submit">
            {createLeave.isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
