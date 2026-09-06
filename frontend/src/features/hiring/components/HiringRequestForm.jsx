import { useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Button from "../../../shared/components/Button";
import SearchableMultiSelect from "../../../shared/forms/SearchableMultiSelect";
import SearchableSelect from "../../../shared/forms/SearchableSelect";
import TextInput from "../../../shared/forms/TextInput";
import { DEPARTMENT_OPTIONS } from "../../../shared/constants";
import { useEligibleManagerCandidates, useEmployeeLocations } from "../../employees/hooks";
import { employeeOptionLabel } from "../../employees/utils/employeeFormatters";
import { EMPLOYMENT_TYPE, EMPLOYMENT_TYPE_LABELS } from "../../employees/constants";
import { FileUploadField, MEDIA_KIND } from "../../media";
import { useRoleOptions } from "../../promotions/hooks";
import { useHiringActions } from "../hooks";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  resume: null,
  proposedRoleId: "",
  proposedRegions: [],
  proposedDistricts: [],
  proposedDepartment: "",
  proposedEmploymentType: "",
  proposedManager: "",
};

const departmentOptions = DEPARTMENT_OPTIONS.map((department) => ({ value: department, label: department }));
const employmentTypeOptions = Object.values(EMPLOYMENT_TYPE).map((type) => ({
  value: type,
  label: EMPLOYMENT_TYPE_LABELS[type],
}));

/**
 * Only the candidate's identity and the proposed placement are captured
 * here. What's still collected later, at the Complete step, is only what
 * actually creates the account (temporaryPassword, dateOfJoining,
 * designation...) — matching the backend's split between createRequest
 * and completeHiring. Department and employment type are proposed here
 * (they narrow the search for a candidate) but stay overridable at
 * Complete, same as region/district/manager already were.
 *
 * The resume is a real upload (Cloudinary, via POST /media/uploads/
 * RESUME). The file is stored the moment it is picked, so what this form
 * submits is a { url, publicId } reference — the request body never
 * carries bytes, and a half-filled form that is abandoned costs nothing
 * but an unreferenced file.
 */
export default function HiringRequestForm({ cancelTo, onCreated }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const roleState = useRoleOptions();
  const locations = useEmployeeLocations();
  const selectedRole = roleState.roles.find((role) => role._id === values.proposedRoleId);
  const managerState = useEligibleManagerCandidates({ forRoleName: selectedRole?.name });
  const actions = useHiringActions({ onSuccess: onCreated });

  const districtOptionSource = values.proposedRegions.length
    ? values.proposedRegions.flatMap((regionId) => locations.districtsForRegion(regionId))
    : locations.districts;
  const seenDistrictIds = new Set();
  const districtOptions = districtOptionSource
    .filter((district) => {
      if (seenDistrictIds.has(district._id)) return false;
      seenDistrictIds.add(district._id);
      return true;
    })
    .map((district) => ({ value: district._id, label: `${district.name} (${district.code})` }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => {
      if (name === "proposedRegions") {
        // Same-state rule: dropping a region should drop any already-
        // picked district that only belonged to it — but clearing every
        // region entirely removes the state filter, so leave existing
        // district picks alone in that case (mirrors districtOptions'
        // own "no region selected -> show every district" fallback).
        const nextDistricts = value.length
          ? current.proposedDistricts.filter((districtId) =>
              value.some((regionId) =>
                locations.districtsForRegion(regionId).some((district) => district._id === districtId),
              ),
            )
          : current.proposedDistricts;
        return { ...current, proposedRegions: value, proposedDistricts: nextDistricts };
      }
      if (name === "proposedRoleId") {
        return { ...current, proposedRoleId: value, proposedManager: "" };
      }
      return { ...current, [name]: value };
    });
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
        ...(values.resume?.url
          ? { resumeUrl: values.resume.url, resumePublicId: values.resume.publicId }
          : {}),
      },
      proposedRoleId: values.proposedRoleId,
      ...(values.proposedRegions.length ? { proposedRegions: values.proposedRegions } : {}),
      ...(values.proposedDistricts.length ? { proposedDistricts: values.proposedDistricts } : {}),
      ...(values.proposedDepartment ? { proposedDepartment: values.proposedDepartment } : {}),
      ...(values.proposedEmploymentType ? { proposedEmploymentType: values.proposedEmploymentType } : {}),
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
        </div>
        <FileUploadField
          kind={MEDIA_KIND.RESUME}
          label="Resume (optional)"
          onChange={(asset) => setValues((current) => ({ ...current, resume: asset }))}
          value={values.resume}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black text-ink">Proposed Placement</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <SearchableSelect
            error={fieldErrors.proposedRoleId}
            id="hiring-role"
            label="Role"
            name="proposedRoleId"
            onChange={handleChange}
            options={roleState.roles.map((role) => ({ value: role._id, label: role.name.toUpperCase() }))}
            placeholder={roleState.isLoading ? "Loading roles..." : "Search roles..."}
            required
            value={values.proposedRoleId}
          />
          <SearchableSelect
            id="hiring-manager"
            label="Reporting Manager (optional)"
            name="proposedManager"
            onChange={handleChange}
            options={managerState.candidates.map((candidate) => ({
              value: candidate._id,
              label: employeeOptionLabel(candidate),
            }))}
            placeholder={managerState.isLoading ? "Loading managers..." : "Search managers..."}
            value={values.proposedManager}
          />
          <SearchableMultiSelect
            id="hiring-regions"
            label="Region / State (optional)"
            name="proposedRegions"
            onChange={handleChange}
            options={locations.regions.map((region) => ({ value: region._id, label: `${region.name} (${region.code})` }))}
            placeholder={locations.isLoading ? "Loading regions..." : "Search states..."}
            value={values.proposedRegions}
          />
          <SearchableMultiSelect
            id="hiring-districts"
            label="District (optional)"
            name="proposedDistricts"
            onChange={handleChange}
            options={districtOptions}
            placeholder={locations.isLoading ? "Loading districts..." : "Search districts..."}
            value={values.proposedDistricts}
          />
          <SearchableSelect
            id="hiring-department"
            label="Department (optional)"
            name="proposedDepartment"
            onChange={handleChange}
            options={departmentOptions}
            placeholder="Search departments..."
            value={values.proposedDepartment}
          />
          <SearchableSelect
            id="hiring-employment-type"
            label="Employment Type (optional)"
            name="proposedEmploymentType"
            onChange={handleChange}
            options={employmentTypeOptions}
            placeholder="Search employment types..."
            value={values.proposedEmploymentType}
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
