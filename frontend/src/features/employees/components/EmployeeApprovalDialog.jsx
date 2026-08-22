import { useEffect, useMemo, useState } from "react";
import Modal from "../../../shared/components/Modal";
import TextInput from "../../../shared/forms/TextInput";
import { useEmployeeActions, useEmployeeList } from "../hooks";
import { pickApprovalPayload, validateApprovalForm } from "../schemas";
import { employeeOptionLabel, getEmployeeDisplayName } from "../utils";
import { EMPLOYEE_STATUS } from "../constants";

export default function EmployeeApprovalDialog({ employee, isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState({
    department: "",
    designation: "",
    dateOfJoining: "",
    manager: "",
  });
  const [errors, setErrors] = useState({});
  const managerQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      employeeStatus: EMPLOYEE_STATUS.ACTIVE,
      sortBy: "employeeCode",
      sortOrder: "asc",
    }),
    [],
  );
  const managerState = useEmployeeList(managerQuery, { enabled: isOpen });
  const actions = useEmployeeActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setValues({
        department: employee?.requestedDepartment || employee?.department || "",
        designation: employee?.requestedDesignation || employee?.designation || "",
        dateOfJoining: "",
        manager: "",
      });
      setErrors({});
    }
  }, [employee, isOpen]);

  const candidates = (managerState.data?.employees || []).filter(
    (candidate) =>
      candidate._id !== employee?._id &&
      candidate.employeeStatus === EMPLOYEE_STATUS.ACTIVE &&
      candidate.user?.status === "ACTIVE" &&
      candidate.user?.role?.name === "sales_manager",
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateApprovalForm(values);
    setErrors(validation.errors);

    if (!validation.isValid || !employee?._id) return;

    await actions.approveEmployee.mutate(employee._id, pickApprovalPayload(values));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Approve ${getEmployeeDisplayName(employee)}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="approval-department"
            label="Department"
            name="department"
            onChange={handleChange}
            type="text"
            value={values.department}
          />
          <TextInput
            id="approval-designation"
            label="Designation"
            name="designation"
            onChange={handleChange}
            type="text"
            value={values.designation}
          />
          <TextInput
            id="approval-date-of-joining"
            label="Date of Joining"
            name="dateOfJoining"
            onChange={handleChange}
            type="date"
            value={values.dateOfJoining}
            error={errors.dateOfJoining}
          />
          <div>
            <label className="form-label" htmlFor="approval-manager">
              Manager
            </label>
            <select
              className="form-field"
              id="approval-manager"
              name="manager"
              onChange={handleChange}
              value={values.manager}
            >
              <option value="">No manager assigned</option>
              {candidates.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {employeeOptionLabel(candidate)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {actions.approveEmployee.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {actions.approveEmployee.errorMessage}
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
            disabled={actions.approveEmployee.isLoading}
            type="submit"
          >
            {actions.approveEmployee.isLoading ? "Approving..." : "Approve Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
