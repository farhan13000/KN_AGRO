import { useEffect, useMemo, useState } from "react";
import Modal from "../../../shared/components/Modal";
import { EMPLOYEE_STATUS } from "../constants";
import { useEmployeeActions, useEmployeeList } from "../hooks";
import { employeeOptionLabel, getEmployeeDisplayName } from "../utils";

export default function ManagerAssignmentDialog({ employee, isOpen, onClose, onSuccess }) {
  const [managerId, setManagerId] = useState("");
  const query = useMemo(
    () => ({
      page: 1,
      limit: 100,
      employeeStatus: EMPLOYEE_STATUS.ACTIVE,
      sortBy: "employeeCode",
      sortOrder: "asc",
    }),
    [],
  );
  const managerState = useEmployeeList(query, { enabled: isOpen });
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

  const candidates = (managerState.data?.employees || []).filter(
    (candidate) =>
      candidate._id !== employee?._id &&
      candidate.employeeStatus === EMPLOYEE_STATUS.ACTIVE &&
      candidate.user?.status === "ACTIVE" &&
      candidate.user?.role?.name === "sales_manager",
  );

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
        <div>
          <label className="form-label" htmlFor="manager-assignment">
            Manager
          </label>
          <select
            className="form-field"
            id="manager-assignment"
            onChange={(event) => setManagerId(event.target.value)}
            value={managerId}
          >
            <option value="">Clear manager assignment</option>
            {candidates.map((candidate) => (
              <option key={candidate._id} value={candidate._id}>
                {employeeOptionLabel(candidate)} - {candidate.department || "No department"}
              </option>
            ))}
          </select>
        </div>

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
