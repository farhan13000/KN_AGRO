import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
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

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
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
      </section>

      {state.isLoading ? <PageLoader message="Loading payroll records..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load payroll" /> : null}
      {!state.isLoading && !state.isError && !state.payrolls.length ? (
        <EmptyState description="No payroll records match these filters." title="No payroll records" />
      ) : null}

      {state.payrolls.length ? (
        <>
          <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full divide-y divide-forest/10 text-left text-sm">
                <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
                  <tr>
                    <th className="px-4 py-3">Payroll No.</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Deductions</th>
                    <th className="px-4 py-3 text-right">Net</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10">
                  {state.payrolls.map((payroll) => (
                    <tr className="align-top transition hover:bg-mint/35" key={payroll._id}>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{payroll.payrollNumber}</td>
                      <td className="px-4 py-3">
                        <span className="block font-black text-ink">
                          {payroll.employee?.user?.name || "—"}
                        </span>
                        <span className="block text-xs text-muted">{payroll.employee?.employeeCode}</span>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatPeriod(payroll.month, payroll.year)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">
                        {formatMoney(payroll.grossSalary)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">
                        {formatMoney(payroll.totalDeductions)}
                      </td>
                      <td className="px-4 py-3 text-right font-black tabular-nums text-forest">
                        {formatMoney(payroll.netSalary)}
                      </td>
                      <td className="px-4 py-3">
                        <PayrollStatusBadge status={payroll.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {payroll.status === PAYROLL_STATUS.DRAFT && canGenerate ? (
                            <button
                              className="inline-flex min-h-9 items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                              onClick={() =>
                                run(actions.processPayroll.mutate, "Payroll processed.", payroll._id)
                              }
                              type="button"
                            >
                              Process
                            </button>
                          ) : null}
                          {payroll.status === PAYROLL_STATUS.PROCESSED && canMarkPaid ? (
                            <button
                              className="inline-flex min-h-9 items-center justify-center rounded-lg bg-forest px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-agriculture"
                              onClick={() =>
                                run(actions.markPayrollPaid.mutate, "Payroll marked paid.", payroll._id)
                              }
                              type="button"
                            >
                              Mark Paid
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
