import ErrorState from "../../../shared/components/ErrorState";
import { formatMoney } from "../../../shared/utils";
import { isMissingEmployeeProfileError } from "../../employees/utils/employeeErrors";
import { useMySalaryStructure } from "../hooks";

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString();
};

/**
 * Self-service twin of CurrentSalaryCard — structurally the same data and
 * the same rendering approach, just scoped to the caller (GET /salary/me,
 * SALARY_READ_SELF) rather than looked up for a named employee. Amounts
 * arrive already in rupees from the backend's serializer, as
 * salaryApi.js's own note records.
 *
 * Every seeded role WITH an Employee record holds SALARY_READ_SELF; SA/OA
 * have no Employee record at all, so this legitimately comes back empty
 * for them and renders the explanatory line rather than an error.
 */
export default function MySalaryCard() {
  const state = useMySalaryStructure();

  // Same rule as My Profile / My Payroll: no employee record means there
  // is simply no salary to show, which the empty state below already says.
  if (state.isError && !isMissingEmployeeProfileError(state.error)) {
    return <ErrorState message={state.errorMessage} title="Unable to load your salary" />;
  }

  const structure = state.salaryStructure;
  const allowances = structure?.allowances || [];
  const deductions = structure?.fixedDeductions || structure?.deductions || [];

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">My Salary</h2>

      {state.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading...</p> : null}

      {!state.isLoading && !structure ? (
        <p className="mt-3 text-sm text-muted">
          {state.isError
            ? "This account isn't attached to an employee record, so it has no salary structure."
            : "No salary structure has been set for your account yet."}
        </p>
      ) : null}

      {structure ? (
        <>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-muted">Basic Salary</p>
              <p className="mt-1 text-2xl font-black text-ink">{formatMoney(structure.basicSalary)}</p>
            </div>
            {formatDate(structure.effectiveFrom) ? (
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-muted">Effective From</p>
                <p className="mt-1 text-sm font-semibold text-ink">{formatDate(structure.effectiveFrom)}</p>
              </div>
            ) : null}
          </div>

          {allowances.length || deductions.length ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {allowances.length ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-agriculture">Allowances</p>
                  <div className="mt-2 divide-y divide-forest/10">
                    {allowances.map((item) => (
                      <div className="flex items-baseline justify-between gap-4 py-1.5" key={item.name}>
                        <span className="text-sm text-muted">{item.name}</span>
                        <span className="text-sm font-semibold tabular-nums text-ink">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {deductions.length ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-agriculture">Deductions</p>
                  <div className="mt-2 divide-y divide-forest/10">
                    {deductions.map((item) => (
                      <div className="flex items-baseline justify-between gap-4 py-1.5" key={item.name}>
                        <span className="text-sm text-muted">{item.name}</span>
                        <span className="text-sm font-semibold tabular-nums text-ink">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
