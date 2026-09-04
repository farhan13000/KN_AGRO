import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import { EMPLOYMENT_TYPE } from "../../employees/constants";
import { useHiringActions } from "../hooks";

const initialValues = {
  temporaryPassword: "",
  phone: "",
  dateOfJoining: "",
  department: "",
  designation: "",
  employmentType: "",
};

/**
 * The final step: everything `completeHiring` needs that the original
 * request didn't capture. This is what actually creates the Employee +
 * User pair, so the temporary password is handed to the new hire out of
 * band — the API never echoes it back.
 */
export default function HiringCompleteDialog({ isOpen, onClose, onSuccess, request }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const actions = useHiringActions({ onSuccess });

  useEffect(() => {
    if (isOpen) {
      setValues({ ...initialValues, phone: request?.candidate?.phone || "" });
      setFieldErrors({});
      setFormError("");
    }
  }, [isOpen, request]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    if (values.temporaryPassword.length < 6) {
      errors.temporaryPassword = "Password must be at least 6 characters.";
    }
    if (!values.dateOfJoining) errors.dateOfJoining = "A joining date is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      temporaryPassword: values.temporaryPassword,
      dateOfJoining: values.dateOfJoining,
      ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      ...(values.department.trim() ? { department: values.department.trim() } : {}),
      ...(values.designation.trim() ? { designation: values.designation.trim() } : {}),
      ...(values.employmentType ? { employmentType: values.employmentType } : {}),
    };

    try {
      await actions.completeHiringRequest.mutate(request._id, payload);
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complete hire — ${request?.candidate?.name || ""}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          This creates the real employee record and login account. Share the temporary password with
          the new hire directly — it is never shown again.
        </p>

        <TextInput
          error={fieldErrors.temporaryPassword}
          id="complete-password"
          label="Temporary Password"
          name="temporaryPassword"
          onChange={handleChange}
          required
          value={values.temporaryPassword}
        />
        <TextInput
          error={fieldErrors.dateOfJoining}
          id="complete-joining"
          label="Date of Joining"
          name="dateOfJoining"
          onChange={handleChange}
          required
          type="date"
          value={values.dateOfJoining}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="complete-phone"
            label="Phone"
            name="phone"
            onChange={handleChange}
            value={values.phone}
          />
          <Select
            id="complete-employment-type"
            label="Employment Type"
            name="employmentType"
            onChange={handleChange}
            options={[
              { value: "", label: "Not specified" },
              ...Object.values(EMPLOYMENT_TYPE).map((type) => ({ value: type, label: type })),
            ]}
            value={values.employmentType}
          />
          <TextInput
            id="complete-department"
            label="Department"
            name="department"
            onChange={handleChange}
            value={values.department}
          />
          <TextInput
            id="complete-designation"
            label="Designation"
            name="designation"
            onChange={handleChange}
            value={values.designation}
          />
        </div>

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
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
            disabled={actions.completeHiringRequest.isLoading}
            type="submit"
          >
            {actions.completeHiringRequest.isLoading ? "Creating account..." : "Create Employee Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
