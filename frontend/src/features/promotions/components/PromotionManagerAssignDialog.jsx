import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import { REQUIRED_MANAGER_ROLE, ROLE_LABELS, normalizeRoleName } from "../../../shared/constants";
import { EMPLOYEE_STATUS, useEmployeeList, employeeOptionLabel } from "../../employees";
import { usePromotionActions } from "../hooks";

const activeEmployeeQuery = Object.freeze({
  page: 1,
  limit: 100,
  employeeStatus: EMPLOYEE_STATUS.ACTIVE,
  sortBy: "employeeCode",
  sortOrder: "asc",
});

const getEmployeeRole = (employee) => normalizeRoleName(employee?.user?.role?.name);

/**
 * Completes a promotion that was approved and passed up: the manager it
 * was escalated to names who the promoted employee will report to.
 *
 * The picker is narrowed to the tier the NEW role must report to
 * (REQUIRED_MANAGER_ROLE) rather than every manager in the company —
 * anything else is rejected by the backend's own
 * validateReportingRelationshipForRole, so offering it would only
 * produce an error after the fact.
 */
export default function PromotionManagerAssignDialog({ isOpen, onClose, onSuccess, promotion }) {
  const [managerId, setManagerId] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  const proposedRole = normalizeRoleName(promotion?.proposedRole?.name);
  const requiredRole = REQUIRED_MANAGER_ROLE[proposedRole];

  const employeesState = useEmployeeList(activeEmployeeQuery, { enabled: isOpen });
  const actions = usePromotionActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setManagerId("");
      setFieldError("");
      setFormError("");
    }
  }, [isOpen]);

  const candidates = useMemo(
    () => (employeesState.data?.employees || []).filter((employee) => getEmployeeRole(employee) === requiredRole),
    [employeesState.data, requiredRole],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!managerId) {
      setFieldError("Select the manager this employee will report to.");
      return;
    }
    setFieldError("");

    try {
      await actions.assignPromotionManager.mutate(promotion._id, managerId);
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const employeeName = promotion?.employee?.user?.name || promotion?.employee?.employeeCode || "This employee";
  const requiredRoleLabel = ROLE_LABELS[requiredRole] || requiredRole?.toUpperCase() || "manager";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign a manager">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          {employeeName}: {promotion?.currentRole?.name?.toUpperCase() || "—"} →{" "}
          {promotion?.proposedRole?.name?.toUpperCase() || "—"}
          {promotion?.finalApprover?.name ? ` — approved by ${promotion.finalApprover.name}` : null}
        </p>

        <p className="text-sm text-muted">
          The promotion completes once a manager is set. A {promotion?.proposedRole?.name?.toUpperCase() || "—"}{" "}
          reports to a {requiredRoleLabel}, so only those are listed.
        </p>

        <Select
          error={fieldError}
          id="promotion-new-manager"
          label={`New manager (${requiredRoleLabel})`}
          onChange={(event) => setManagerId(event.target.value)}
          options={[
            { label: `Select a ${requiredRoleLabel}`, value: "" },
            ...candidates.map((employee) => ({ label: employeeOptionLabel(employee), value: employee._id })),
          ]}
          required
          value={managerId}
        />

        {!employeesState.isLoading && !candidates.length ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            No active {requiredRoleLabel} exists to assign. One has to be created before this promotion can
            complete.
          </p>
        ) : null}

        {employeesState.errorMessage ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {employeesState.errorMessage}
          </p>
        ) : null}

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
            disabled={actions.assignPromotionManager.isLoading}
            type="submit"
          >
            {actions.assignPromotionManager.isLoading ? "Saving..." : "Assign Manager"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
