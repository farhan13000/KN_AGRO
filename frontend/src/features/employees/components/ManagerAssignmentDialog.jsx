import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import { useEligibleManagerCandidates, useEmployeeActions } from "../hooks";
import SearchableSelect from "../../../shared/forms/SearchableSelect";
import { employeeSelectOption, getEmployeeDisplayName } from "../utils";

export default function ManagerAssignmentDialog({ employee, isOpen, onClose, onSuccess }) {
  const [managerId, setManagerId] = useState("");
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
      setManagerId(employee?.manager?._id || "");
    }
  }, [employee, isOpen]);

  const candidates = managerState.candidates;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!employee?._id) return;
    await actions.assignManager.mutate(employee._id, managerId || null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign manager for ${getEmployeeDisplayName(employee)}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Current manager: {employee?.manager?.user?.name || "Not assigned"}
        </div>
        <SearchableSelect
          id="manager-assignment"
          label="Manager"
          onChange={(event) => setManagerId(event.target.value)}
          options={[
            { value: "", label: "Clear manager assignment" },
            ...candidates.map((candidate) => ({
              ...employeeSelectOption(candidate),
              label: `${employeeSelectOption(candidate).label} - ${candidate.department || "No department"}`,
            })),
          ]}
          value={managerId}
        />

        {managerState.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {managerState.errorMessage}
          </p>
        ) : null}
        {actions.assignManager.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {actions.assignManager.errorMessage}
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
            disabled={actions.assignManager.isLoading}
            type="submit"
          >
            {actions.assignManager.isLoading ? "Saving..." : "Confirm Assignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
