import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import { DataTable, FilterPanel } from "../../../shared/components";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { PERMISSIONS } from "../../../shared/constants";
import { formatMoney } from "../../../shared/utils";
import { MONTH_LABELS, PAYROLL_STATUS, formatPeriod } from "../constants";
import { useAllPayroll, usePayrollActions } from "../hooks";
import PayrollGenerateDialog from "./PayrollGenerateDialog";
import PayrollStatusBadge from "./PayrollStatusBadge";

/**
 * Company-wide payroll, gated PAYROLL_READ — which OA holds and the
 * sales-hierarchy roles deliberately do not (payroll is company-financial
 * data, not team data).
 *
 * Generate / Process / Mark Paid are gated on their own separate
 * permissions, which OA does NOT hold: OA therefore sees this list
 * read-only without any action buttons, purely by permission checks — no
 * role-name special-casing anywhere in here.
 */
export default function AllPayrollView() {
  const { hasPermission } = useAuth();
  const [filters, setFilters] = useState({ status: "", month: "", year: "", page: 1 });
  const [generateOpen, setGenerateOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const state = useAllPayroll(filters);
  const actions = usePayrollActions();

  const canGenerate = hasPermission(PERMISSIONS.PAYROLL_PROCESS);
  const canMarkPaid = hasPermission(PERMISSIONS.PAYROLL_MARK_PAID);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const run = async (mutate, successText, payrollId) => {
    setActionError("");
    setMessage("");
    try {
      await mutate(payrollId);
      setMessage(successText);
      await state.refetch();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const columns = [
    {
      key: "payrollNumber",
      header: "Payroll No.",
      cellClassName: "font-mono text-xs text-muted",
      cell: (payroll) => payroll.payrollNumber,
    },
    {
      key: "employee",
      header: "Employee",
      role: "title",
      cell: (payroll) => (
        <>
          <span className="block font-black text-ink">{payroll.employee?.user?.name || "—"}</span>
          <span className="block text-xs text-muted">{payroll.employee?.employeeCode}</span>
        </>
      ),
    },
    {
      key: "period",
      header: "Period",
      cellClassName: "text-muted",
      cell: (payroll) => formatPeriod(payroll.month, payroll.year),
    },
    {
      key: "grossSalary",
      header: "Gross",
      align: "right",
      cellClassName: "tabular-nums text-muted",
      cell: (payroll) => formatMoney(payroll.grossSalary),
    },
    {
      key: "totalDeductions",
      header: "Deductions",
      align: "right",
      cellClassName: "tabular-nums text-muted",
      cell: (payroll) => formatMoney(payroll.totalDeductions),
    },
    {
      key: "netSalary",
      header: "Net",
      align: "right",
      cellClassName: "font-black tabular-nums text-forest",
      cell: (payroll) => formatMoney(payroll.netSalary),
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (payroll) => <PayrollStatusBadge status={payroll.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (payroll) => (
        <div className="flex justify-end gap-2">
          {payroll.status === PAYROLL_STATUS.DRAFT && canGenerate ? (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint md:min-h-9"
              onClick={() => run(actions.processPayroll.mutate, "Payroll processed.", payroll._id)}
              type="button"
            >
              Process
            </button>
          ) : null}
          {payroll.status === PAYROLL_STATUS.PROCESSED && canMarkPaid ? (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-agriculture md:min-h-9"
              onClick={() => run(actions.markPayrollPaid.mutate, "Payroll marked paid.", payroll._id)}
              type="button"
            >
              Mark Paid
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Payroll</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Payroll Runs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Every payslip company-wide. A record is generated as a draft, then processed, then marked
            paid — each step is a separate, separately-permissioned action.
          </p>
        </div>
        {canGenerate ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            onClick={() => setGenerateOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Generate Payroll
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-lg border border-forest/15 bg-mint/60 px-4 py-3 text-sm font-semibold text-forest">
          {message}
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {actionError}
        </p>
      ) : null}

      <FilterPanel>
        <div className="grid gap-3 md:grid-cols-3">
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={updateFilter} value={filters.status}>
              <option value="">All statuses</option>
              {Object.values(PAYROLL_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Month</span>
            <select className="form-field" name="month" onChange={updateFilter} value={filters.month}>
              <option value="">All months</option>
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={String(index + 1)}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Year</span>
            <input
              className="form-field"
              max="2100"
              min="2000"
              name="year"
              onChange={updateFilter}
              placeholder="All years"
              type="number"
              value={filters.year}
            />
          </label>
        </div>
      </FilterPanel>

      {state.isLoading ? <PageLoader message="Loading payroll records..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load payroll" /> : null}
      {!state.isLoading && !state.isError && !state.payrolls.length ? (
        <EmptyState description="No payroll records match these filters." title="No payroll records" />
      ) : null}

      {state.payrolls.length ? (
        <>
          <DataTable columns={columns} minWidth="900px" rows={state.payrolls} />

          <Pagination
            ariaLabel="Payroll pagination"
            page={state.pagination.page || filters.page}
            totalPages={state.pagination.pages || 1}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          />
        </>
      ) : null}

      <PayrollGenerateDialog
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={() => state.refetch()}
      />
    </div>
  );
}
