import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import { useAllEmployees } from "../../employees/hooks";
import { employeeOptionLabel } from "../../employees/utils/employeeFormatters";
import { MONTH_LABELS } from "../constants";
import { usePayrollActions } from "../hooks";

const now = new Date();

/**
 * Single-employee and bulk generation in one dialog — they take the same
 * month/year and differ only in scope, so splitting them into two dialogs
 * would duplicate the period picker for no benefit.
 *
 * Bulk scope mirrors the backend exactly: `manager` and `department` are
 * optional narrowing filters, and omitting BOTH targets every ACTIVE
 * employee — which the UI states plainly, since that is a large action.
 */
export default function PayrollGenerateDialog({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("single");
  const [values, setValues] = useState({
    employeeId: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    department: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState("");

  const employeesState = useAllEmployees({ enabled: isOpen });
  const actions = usePayrollActions();

  useEffect(() => {
    if (isOpen) {
      setMode("single");
      setValues({
        employeeId: "",
        month: String(now.getMonth() + 1),
        year: String(now.getFullYear()),
        department: "",
      });
      setFieldErrors({});
      setFormError("");
      setResult("");
    }
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setResult("");

    const errors = {};
    if (mode === "single" && !values.employeeId) errors.employeeId = "Choose an employee.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const month = Number(values.month);
    const year = Number(values.year);

    try {
      if (mode === "single") {
        await actions.generatePayroll.mutate({ employeeId: values.employeeId, month, year });
        setResult("Payroll generated as DRAFT.");
      } else {
        const data = await actions.generateBulkPayroll.mutate({
          month,
          year,
          ...(values.department.trim() ? { department: values.department.trim() } : {}),
        });
        const created = data?.created ?? data?.payrolls?.length;
        setResult(
          created === undefined
            ? "Bulk generation completed."
            : `Bulk generation completed — ${created} payroll record(s) created as DRAFT.`,
        );
      }
      await onSuccess?.();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const isBusy = actions.generatePayroll.isLoading || actions.generateBulkPayroll.isLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Payroll">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-2 rounded-lg bg-mint/50 p-1">
          {[
            { key: "single", label: "One employee" },
            { key: "bulk", label: "Bulk" },
          ].map((option) => (
            <button
              className={`flex-1 rounded-md px-4 py-2 text-sm font-bold transition ${
                mode === option.key ? "bg-forest text-white shadow-sm" : "text-forest hover:bg-white"
              }`}
              key={option.key}
              onClick={() => setMode(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="payroll-month"
            label="Month"
            name="month"
            onChange={handleChange}
            options={MONTH_LABELS.map((label, index) => ({ value: String(index + 1), label }))}
            value={values.month}
          />
          <TextInput
            id="payroll-year"
            label="Year"
            max="2100"
            min="2000"
            name="year"
            onChange={handleChange}
            type="number"
            value={values.year}
          />
        </div>

        {mode === "single" ? (
          <Select
            error={fieldErrors.employeeId}
            id="payroll-employee"
            label="Employee"
            name="employeeId"
            onChange={handleChange}
            options={[
              { value: "", label: employeesState.isLoading ? "Loading employees..." : "Select an employee" },
              ...employeesState.employees.map((employee) => ({
                value: employee._id,
                label: employeeOptionLabel(employee),
              })),
            ]}
            required
            value={values.employeeId}
          />
        ) : (
          <>
            <TextInput
              id="payroll-department"
              label="Department (optional)"
              name="department"
              onChange={handleChange}
              placeholder="Leave blank to include every active employee"
              value={values.department}
            />
            <p className="rounded-lg bg-mint/60 px-3 py-2 text-sm font-semibold text-forest">
              {values.department.trim()
                ? `Generates a DRAFT payslip for every active employee in "${values.department.trim()}".`
                : "Generates a DRAFT payslip for every active employee."}
            </p>
          </>
        )}

        {result ? (
          <p className="rounded-lg border border-forest/15 bg-mint/60 px-3 py-2 text-sm font-semibold text-forest">
            {result}
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
            Close
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
