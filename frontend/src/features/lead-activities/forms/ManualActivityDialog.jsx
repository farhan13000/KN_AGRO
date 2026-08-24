import { useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { LEAD_ACTIVITY_TYPE_LABELS, MANUAL_ACTIVITY_TYPES } from "../constants";
import { useLeadActivityActions } from "../hooks";
import { getCrmErrorMessage, shouldRefetchAfterCrmError } from "../../leads/utils";

const initialValues = {
  type: "CALL",
  title: "",
  description: "",
  followUpAt: "",
};

const manualTypeOptions = MANUAL_ACTIVITY_TYPES.map((type) => ({
  label: LEAD_ACTIVITY_TYPE_LABELS[type],
  value: type,
}));

const toIsoDateTime = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const ignoreHandledError = () => {};

export default function ManualActivityDialog({ isOpen, lead, onClose, onSuccess }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const actions = useLeadActivityActions({
    onError: async (error) => {
      if (shouldRefetchAfterCrmError(error)) await onSuccess?.();
    },
    onSuccess: async () => {
      await onSuccess?.();
      setValues(initialValues);
      onClose();
    },
  });

  const updateField = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!MANUAL_ACTIVITY_TYPES.includes(values.type)) nextErrors.type = "Select a valid activity type.";
    if (!values.title.trim()) nextErrors.title = "Title is required.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await actions.createManualActivity.mutate(lead._id, {
      ...values,
      followUpAt: toIsoDateTime(values.followUpAt),
    }).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log activity for ${lead?.name || "lead"}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          error={errors.type}
          id="lead-activity-type"
          label="Activity Type"
          name="type"
          onChange={updateField}
          options={manualTypeOptions}
          required
          value={values.type}
        />
        <TextInput
          error={errors.title}
          id="lead-activity-title"
          label="Title"
          name="title"
          onChange={updateField}
          required
          value={values.title}
        />
        <Textarea
          id="lead-activity-description"
          label="Description"
          maxLength={2000}
          name="description"
          onChange={updateField}
          value={values.description}
        />
        <TextInput
          id="lead-activity-follow-up"
          label="Follow-Up Discussed"
          name="followUpAt"
          onChange={updateField}
          type="datetime-local"
          value={values.followUpAt}
        />
        {actions.createManualActivity.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
            {getCrmErrorMessage(actions.createManualActivity.error, "Unable to log this activity.")}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.createManualActivity.isLoading} type="submit">
            {actions.createManualActivity.isLoading ? "Saving..." : "Log Activity"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
