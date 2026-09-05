import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import TextInput from "../../../shared/forms/TextInput";
import { getApiErrorMessage } from "../../../core/api";
import { useMyTeam } from "../../employees";
import { REPORT_PRIORITY, REPORT_PRIORITY_LABELS, REPORT_TYPE, REPORT_TYPE_LABELS } from "../constants";
import { useReportRequestActions } from "../hooks";

const emptyForm = {
  type: REPORT_TYPE.GENERAL,
  title: "",
  description: "",
  assignedTo: "",
  dueDate: "",
  priority: REPORT_PRIORITY.MEDIUM,
};

// assignedTo is picked from the requester's own real downline
// (useMyTeam, the same manager-scoped "my team" endpoint the existing
// Team page already uses) — not a company-wide employee list, and not a
// hand-rolled hierarchy walk (the backend's own createReportRequest
// enforces the real scope regardless; this just offers a sensible list).
export default function ReportRequestCreateDialog({ isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const { createReportRequest } = useReportRequestActions();
  const teamState = useMyTeam({ limit: 100 }, { enabled: isOpen });
  const teamMembers = teamState.data?.employees || [];

  const resetAndClose = () => {
    setValues(emptyForm);
    setFormError("");
    onClose();
  };

  const handleChange = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!values.title.trim()) {
      setFormError("A title is required.");
      return;
    }
    if (!values.assignedTo) {
      setFormError("Select who this report is requested from.");
      return;
    }

    try {
      await createReportRequest.mutate({
        type: values.type,
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate || undefined,
        priority: values.priority,
      });
      resetAndClose();
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Request a Report">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          id="report-request-assigned-to"
          label="Requested From"
          onChange={handleChange("assignedTo")}
          options={[
            { value: "", label: teamState.isLoading ? "Loading your team..." : "Select an employee" },
            ...teamMembers.map((employee) => ({
              value: employee._id,
              label: employee.user?.name || employee.employeeCode,
            })),
          ]}
          required
          value={values.assignedTo}
        />
        <Select
          id="report-request-type"
          label="Report Type"
          onChange={handleChange("type")}
          options={Object.values(REPORT_TYPE).map((value) => ({ value, label: REPORT_TYPE_LABELS[value] }))}
          required
          value={values.type}
        />
        <TextInput
          id="report-request-title"
          label="Title"
          onChange={handleChange("title")}
          required
          value={values.title}
        />
        <Textarea
          id="report-request-description"
          label="Description"
          onChange={handleChange("description")}
          value={values.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="report-request-due-date"
            label="Due Date"
            onChange={handleChange("dueDate")}
            type="date"
            value={values.dueDate}
          />
          <Select
            id="report-request-priority"
            label="Priority"
            onChange={handleChange("priority")}
            options={Object.values(REPORT_PRIORITY).map((value) => ({ value, label: REPORT_PRIORITY_LABELS[value] }))}
            value={values.priority}
          />
        </div>
        {formError ? <p className="text-sm font-semibold text-red-700">{formError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button onClick={resetAndClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={createReportRequest.isLoading} type="submit">
            {createReportRequest.isLoading ? "Requesting..." : "Request Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
