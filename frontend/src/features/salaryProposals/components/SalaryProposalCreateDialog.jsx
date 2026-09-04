import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { formatMoney } from "../../../shared/utils";
import { useCurrentSalaryStructure } from "../../salary";
import { getEmployeeDisplayName } from "../../employees/utils/employeeFormatters";
import { useSalaryProposalActions } from "../hooks";

/**
 * Propose a salary change for one employee. Current salary is shown
 * read-only (from the existing SalaryStructure endpoint — see
 * features/salary/CurrentSalaryCard's own note on why this display exists
 * at all) and is never itself submitted; only proposedSalary/
 * effectiveDate/changeReason go in the request body.
 *
 * Holding SALARY_PROPOSAL_CREATE doesn't mean this employee is yours to
 * propose for — the backend also requires canManageEmployee (except for
 * OA, exempted since it sits outside the hierarchy). That 403 renders
 * inline here rather than being guessed at client-side.
 */
export default function SalaryProposalCreateDialog({ employee, isOpen, onClose, onSuccess }) {
  const [proposedSalary, setProposedSalary] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const currentSalaryState = useCurrentSalaryStructure(isOpen ? employee?._id : undefined);
  const actions = useSalaryProposalActions({
    onSuccess: async (proposal) => {
      await onSuccess?.(proposal);
    },
  });

  useEffect(() => {
    if (isOpen) {
      setProposedSalary("");
      setEffectiveDate("");
      setChangeReason("");
      setFieldErrors({});
      setFormError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    const proposedValue = Number(proposedSalary);
    if (!proposedSalary || !Number.isFinite(proposedValue) || proposedValue <= 0) {
      errors.proposedSalary = "Enter a proposed salary greater than 0.";
    }
    if (!effectiveDate) errors.effectiveDate = "Choose an effective date.";
    if (!changeReason.trim()) errors.changeReason = "A reason is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await actions.createSalaryProposal.mutate(employee._id, {
        proposedSalary: proposedValue,
        effectiveDate,
        changeReason: changeReason.trim(),
      });
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Propose salary change for ${getEmployeeDisplayName(employee)}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Current salary:{" "}
          {currentSalaryState.isLoading
            ? "Loading..."
            : currentSalaryState.salaryStructure
              ? formatMoney(currentSalaryState.salaryStructure.basicSalary)
              : "Not set yet"}
        </p>

        <TextInput
          error={fieldErrors.proposedSalary}
          id="salary-proposal-amount"
          label="Proposed Salary (INR)"
          min="1"
          name="proposedSalary"
          onChange={(event) => setProposedSalary(event.target.value)}
          required
          step="0.01"
          type="number"
          value={proposedSalary}
        />

        <TextInput
          error={fieldErrors.effectiveDate}
          id="salary-proposal-effective-date"
          label="Effective Date"
          name="effectiveDate"
          onChange={(event) => setEffectiveDate(event.target.value)}
          required
          type="date"
          value={effectiveDate}
        />

        <Textarea
          error={fieldErrors.changeReason}
          id="salary-proposal-reason"
          label="Change Reason"
          maxLength={1000}
          name="changeReason"
          onChange={(event) => setChangeReason(event.target.value)}
          required
          value={changeReason}
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
            disabled={actions.createSalaryProposal.isLoading}
            type="submit"
          >
            {actions.createSalaryProposal.isLoading ? "Submitting..." : "Submit Proposal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
