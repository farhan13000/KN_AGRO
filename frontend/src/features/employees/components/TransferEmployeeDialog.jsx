import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { useEligibleManagerCandidates, useEmployeeActions } from "../hooks";
import SearchableSelect from "../../../shared/forms/SearchableSelect";
import EmployeeCoverageFields from "../forms/EmployeeCoverageFields";
import { employeeSelectOption, getEmployeeDisplayName } from "../utils";

const NO_CHANGE = "";
const EMPTY_COVERAGE = { states: [], districts: [], posts: [] };

const emptyForm = {
  toManager: NO_CHANGE,
  reason: "",
  effectiveAt: "",
};

/**
 * Manager and coverage are each independently optional here, matching
 * the backend: one transfer may change either or both, so leaving
 * coverage untouched (the "Change coverage" toggle off) omits it from
 * the payload entirely — omitted means unchanged, distinct from an
 * explicit (empty) value.
 */
export default function TransferEmployeeDialog({ employee, isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState(emptyForm);
  const [changeCoverage, setChangeCoverage] = useState(false);
  const [coverage, setCoverage] = useState(EMPTY_COVERAGE);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Narrowed to the one tier this employee's role must report to, so the
  // list cannot offer a pairing the backend will then refuse — a GM, for
  // instance, is only ever shown Office Admins.
  const managerState = useEligibleManagerCandidates({
    enabled: isOpen,
    excludeEmployeeId: employee?._id,
    forRoleName: employee?.user?.role?.name,
  });
  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setValues(emptyForm);
      setChangeCoverage(false);
      setCoverage(employee?.coverage || EMPTY_COVERAGE);
      setFormError("");
      setFieldErrors({});
    }
  }, [isOpen, employee]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleCoverageChange = (event) => {
    setCoverage(event.target.value);
    setFieldErrors((current) => ({ ...current, coverageStates: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    if (!values.reason.trim()) errors.reason = "A reason is required.";
    if (!values.toManager && !changeCoverage) {
      errors.toManager = "Choose a new manager, or turn on coverage change, to transfer this employee.";
    }
    if (changeCoverage && !coverage.states.length) {
      errors.coverageStates = "Pick at least one state this employee will cover.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      ...(values.toManager ? { toManager: values.toManager } : {}),
      ...(changeCoverage ? { toCoverage: coverage } : {}),
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Transfer ${getEmployeeDisplayName(employee)}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Leave manager on "No change" to keep it as it is. At least one of manager or coverage must
          change, and every transfer is recorded permanently in this employee's history.
        </p>

        <SearchableSelect
          error={fieldErrors.toManager}
          id="transfer-manager"
          label="New Manager"
          name="toManager"
          onChange={handleChange}
          options={[
            { value: NO_CHANGE, label: managerState.isLoading ? "Loading managers..." : "No change" },
            ...managerState.candidates.map(employeeSelectOption),
          ]}
          value={values.toManager}
        />

        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            checked={changeCoverage}
            className="h-4 w-4 rounded border-forest/30"
            onChange={(event) => setChangeCoverage(event.target.checked)}
            type="checkbox"
          />
          Change coverage (locations covered)
        </label>

        {changeCoverage ? (
          <EmployeeCoverageFields
            errors={fieldErrors}
            hint="Naya coverage — jo pehle se assign tha wo replace ho jayega."
            onChange={handleCoverageChange}
            title="New Coverage"
            value={coverage}
          />
        ) : null}

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
