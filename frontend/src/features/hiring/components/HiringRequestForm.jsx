import { useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Button from "../../../shared/components/Button";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import { useEligibleManagerCandidates, useEmployeeLocations } from "../../employees/hooks";
import { employeeOptionLabel } from "../../employees/utils/employeeFormatters";
import { useRoleOptions } from "../../promotions/hooks";
import { useHiringActions } from "../hooks";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  resumeUrl: "",
  proposedRoleId: "",
  proposedRegion: "",
  proposedDistrict: "",
  proposedManager: "",
};

/**
 * Only the candidate's identity and the proposed placement are captured
 * here. Everything needed to actually create the account
 * (temporaryPassword, dateOfJoining, department...) is collected later,
 * at the Complete step — matching the backend's split between
 * createRequest and completeHiring.
 *
 * `resumeUrl` is a plain URL field on purpose: this codebase builds no
 * file-upload infrastructure, per the backend's own note on the field.
 */
export default function HiringRequestForm({ cancelTo, onCreated }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const roleState = useRoleOptions();
  const locations = useEmployeeLocations();
  const managerState = useEligibleManagerCandidates();
  const actions = useHiringActions({ onSuccess: onCreated });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) =>
      name === "proposedRegion"
        ? { ...current, proposedRegion: value, proposedDistrict: "" }
        : { ...current, [name]: value },
    );
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    if (!values.name.trim()) errors.name = "Candidate name is required.";
    if (!values.email.trim()) errors.email = "A valid candidate email is required.";
    if (values.phone.trim().length < 6) errors.phone = "Phone number is too short.";
    if (!values.proposedRoleId) errors.proposedRoleId = "Choose the role being hired for.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      candidate: {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        ...(values.resumeUrl.trim() ? { resumeUrl: values.resumeUrl.trim() } : {}),
      },
      proposedRoleId: values.proposedRoleId,
      ...(values.proposedRegion ? { proposedRegion: values.proposedRegion } : {}),
      ...(values.proposedDistrict ? { proposedDistrict: values.proposedDistrict } : {}),
      ...(values.proposedManager ? { proposedManager: values.proposedManager } : {}),
    };

    try {
      await actions.createHiringRequest.mutate(payload);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="space-y-4">
        <h2 className="text-lg font-black text-ink">Candidate</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            error={fieldErrors.name}
            id="hiring-name"
            label="Full Name"
            name="name"
            onChange={handleChange}
            required
            value={values.name}
          />
          <TextInput
            error={fieldErrors.email}
            id="hiring-email"
            label="Email"
            name="email"
            onChange={handleChange}
            required
            type="email"
            value={values.email}
          />
          <TextInput
            error={fieldErrors.phone}
            id="hiring-phone"
            label="Phone"
            name="phone"
            onChange={handleChange}
            required
            value={values.phone}
          />
          <TextInput
            id="hiring-resume"
            label="Resume URL (optional)"
            name="resumeUrl"
            onChange={handleChange}
            placeholder="https://..."
            type="url"
            value={values.resumeUrl}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-ink">Proposed Placement</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            error={fieldErrors.proposedRoleId}
            id="hiring-role"
            label="Role"
            name="proposedRoleId"
            onChange={handleChange}
            options={[
              { value: "", label: roleState.isLoading ? "Loading roles..." : "Select a role" },
              ...roleState.roles.map((role) => ({ value: role._id, label: role.name.toUpperCase() })),
            ]}
            required
            value={values.proposedRoleId}
          />
          <Select
            id="hiring-manager"
            label="Reporting Manager (optional)"
            name="proposedManager"
            onChange={handleChange}
            options={[
              { value: "", label: managerState.isLoading ? "Loading managers..." : "Not specified" },
              ...managerState.candidates.map((candidate) => ({
                value: candidate._id,
                label: employeeOptionLabel(candidate),
              })),
            ]}
            value={values.proposedManager}
          />
          <Select
            id="hiring-region"
            label="Region (optional)"
            name="proposedRegion"
            onChange={handleChange}
            options={[
              { value: "", label: locations.isLoading ? "Loading regions..." : "Not specified" },
              ...locations.regions.map((region) => ({
                value: region._id,
                label: `${region.name} (${region.code})`,
              })),
            ]}
            value={values.proposedRegion}
          />
          <Select
            id="hiring-district"
            label="District (optional)"
            name="proposedDistrict"
            onChange={handleChange}
            options={[
              { value: "", label: locations.isLoading ? "Loading districts..." : "Not specified" },
              ...locations.districtsForRegion(values.proposedRegion).map((district) => ({
                value: district._id,
                label: `${district.name} (${district.code})`,
              })),
            ]}
            value={values.proposedDistrict}
          />
        </div>
      </section>

      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button to={cancelTo} variant="secondary">
          Cancel
        </Button>
        <Button disabled={actions.createHiringRequest.isLoading} type="submit">
          {actions.createHiringRequest.isLoading ? "Submitting..." : "Submit Hiring Request"}
        </Button>
      </div>
    </form>
  );
}
