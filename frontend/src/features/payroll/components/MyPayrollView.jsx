import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { formatMoney } from "../../../shared/utils";
import { isMissingEmployeeProfileError } from "../../employees/utils/employeeErrors";
import { formatPeriod } from "../constants";
import { useMyPayroll } from "../hooks";
import PayrollStatusBadge from "./PayrollStatusBadge";
import PayslipBreakdown from "./PayslipBreakdown";

export default function MyPayrollView({ portalLabel }) {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState("");
  const state = useMyPayroll({ page });
  const noProfile = state.isError && isMissingEmployeeProfileError(state.error);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">My Payroll</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Your payslip history. Each month shows the figures frozen at the time it was generated, so a
          later salary change never rewrites what you were actually paid.
        </p>
      </div>

      {state.isLoading ? <PageLoader message="Loading your payroll history..." /> : null}

      {/* An account with no Employee record (an admin/login-only account)
          has no payroll by definition — that is a plain fact to state, not
          an error to alarm someone with. */}
      {noProfile ? (
        <EmptyState
          description="This account isn't attached to an employee record, so no payslips are generated for it."
          title="No employee profile for this account"
        />
      ) : null}

      {state.isError && !noProfile ? (
        <ErrorState message={state.errorMessage} title="Unable to load payroll" />
      ) : null}

      {!state.isLoading && !state.isError && !state.payrolls.length ? (
        <EmptyState
          description="No payslips have been generated for you yet."
          title="No payroll records"
        />
      ) : null}

      {state.payrolls.length ? (
        <>
          <ul className="space-y-3">
            {state.payrolls.map((payroll) => {
              const open = expandedId === payroll._id;
              return (
                <li className="rounded-lg border border-forest/10 bg-white shadow-sm" key={payroll._id}>
                  <button
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                    onClick={() => setExpandedId(open ? "" : payroll._id)}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      {open ? (
                        <ChevronDown className="h-5 w-5 text-forest" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-forest" />
                      )}
                      <span>
                        <span className="block text-sm font-black text-ink">
                          {formatPeriod(payroll.month, payroll.year)}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-muted">
                          {payroll.payrollNumber}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-5">
                      <span className="text-right">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
                          Gross
                        </span>
                        <span className="block text-sm font-semibold tabular-nums text-ink">
                          {formatMoney(payroll.grossSalary)}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
                          Deductions
                        </span>
                        <span className="block text-sm font-semibold tabular-nums text-ink">
                          {formatMoney(payroll.totalDeductions)}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
                          Net
                        </span>
                        <span className="block text-sm font-black tabular-nums text-forest">
                          {formatMoney(payroll.netSalary)}
                        </span>
                      </span>
                      <PayrollStatusBadge status={payroll.status} />
                    </span>
                  </button>

                  {open ? (
                    <div className="border-t border-forest/10 p-4">
                      <PayslipBreakdown payroll={payroll} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <Pagination
            ariaLabel="Payroll pagination"
            page={state.pagination.page || page}
            totalPages={state.pagination.pages || 1}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  );
}
