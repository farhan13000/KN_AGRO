import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { useEligibleManagerCandidates, useEmployeeActions, useEmployeeLocations } from "../hooks";
import { employeeOptionLabel, getEmployeeDisplayName } from "../utils";

const NO_CHANGE = "";

const emptyForm = {
  toManager: NO_CHANGE,
  toRegion: NO_CHANGE,
  toDistrict: NO_CHANGE,
  reason: "",
  effectiveAt: "",
};

/**
 * Manager / region / district are each independently optional here,
 * matching the backend: one transfer may change any subset of the three,
 * so anything left on "No change" is simply omitted from the payload
 * (omitted means unchanged; the API distinguishes that from an explicit
 * null, which would clear the field).
 */
export default function TransferEmployeeDialog({ employee, isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const managerState = useEligibleManagerCandidates({
    enabled: isOpen,
    excludeEmployeeId: employee?._id,
  });
  const locations = useEmployeeLocations({ enabled: isOpen });
  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setValues(emptyForm);
      setFormError("");
      setFieldErrors({});
    }
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => {
      // Switching region invalidates a district chosen under the old one.
      if (name === "toRegion") return { ...current, toRegion: value, toDistrict: NO_CHANGE };
      return { ...current, [name]: value };
    });
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    if (!values.reason.trim()) errors.reason = "A reason is required.";
    if (!values.toManager && !values.toRegion && !values.toDistrict) {
      errors.toManager = "Choose at least one of manager, region, or district to change.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      ...(values.toManager ? { toManager: values.toManager } : {}),
      ...(values.toRegion ? { toRegion: values.toRegion } : {}),
      ...(values.toDistrict ? { toDistrict: values.toDistrict } : {}),
      reason: values.reason.trim(),
      ...(values.effectiveAt ? { effectiveAt: values.effectiveAt } : {}),
    };

    try {
      await actions.transferEmployee.mutate(employee._id, payload);
      onClose();
    } catch (error) {
      // Surfaces the backend's own rejection (e.g. an ineligible manager
      // tier from validateReportingRelationship) rather than a generic
      // failure message.
      setFormError(getApiErrorMessage(error));
    }
  };

  const districtOptions = locations.districtsForRegion(values.toRegion);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Transfer ${getEmployeeDisplayName(employee)}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Leave a field on "No change" to keep it as it is. At least one change is required, and
          every transfer is recorded permanently in this employee's history.
        </p>

        <Select
          error={fieldErrors.toManager}
          id="transfer-manager"
          label="New Manager"
          name="toManager"
          onChange={handleChange}
          options={[
            { value: NO_CHANGE, label: managerState.isLoading ? "Loading managers..." : "No change" },
            ...managerState.candidates.map((candidate) => ({
              value: candidate._id,
              label: employeeOptionLabel(candidate),
            })),
          ]}
          value={values.toManager}
        />

        <Select
          id="transfer-region"
          label="New Region"
          name="toRegion"
          onChange={handleChange}
          options={[
            { value: NO_CHANGE, label: locations.isLoading ? "Loading regions..." : "No change" },
            ...locations.regions.map((region) => ({
              value: region._id,
              label: `${region.name} (${region.code})`,
            })),
          ]}
          value={values.toRegion}
        />

        <Select
          id="transfer-district"
          label="New District"
          name="toDistrict"
          onChange={handleChange}
          options={[
            { value: NO_CHANGE, label: locations.isLoading ? "Loading districts..." : "No change" },
            ...districtOptions.map((district) => ({
              value: district._id,
              label: `${district.name} (${district.code})`,
            })),
          ]}
          value={values.toDistrict}
        />

        <Textarea
          error={fieldErrors.reason}
          id="transfer-reason"
          label="Reason"
          maxLength={500}
          name="reason"
          onChange={handleChange}
          required
          value={values.reason}
        />

        <TextInput
          id="transfer-effective-at"
          label="Effective Date (optional)"
          name="effectiveAt"
          onChange={handleChange}
          type="date"
          value={values.effectiveAt}
        />

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
            disabled={actions.transferEmployee.isLoading}
            type="submit"
          >
            {actions.transferEmployee.isLoading ? "Transferring..." : "Confirm Transfer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
