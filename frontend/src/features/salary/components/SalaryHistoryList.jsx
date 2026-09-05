import ErrorState from "../../../shared/components/ErrorState";
import { formatMoney } from "../../../shared/utils";
import { useSalaryHistory } from "../hooks";

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
};

/**
 * Every salary structure this employee has had, newest effective date
 * first. Sits alongside CurrentSalaryCard (which shows only the active
 * one) rather than replacing it, and is gated by SALARY_READ — OA + SA
 * wildcard only, deliberately NOT widened to manager tiers, since this is
 * company-financial data rather than sales-hierarchy data.
 */
export default function SalaryHistoryList({ employeeId }) {
  const state = useSalaryHistory(employeeId);

  if (state.isError) {
    return <ErrorState message={state.errorMessage} title="Unable to load salary history" />;
  }

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Salary History</h2>
      <p className="mt-1 text-sm text-muted">
        Past and present salary structures for this employee, most recent first.
      </p>

      {state.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading...</p> : null}

      {!state.isLoading && !state.structures.length ? (
        <p className="mt-3 text-sm text-muted">No salary structures have been recorded yet.</p>
      ) : null}

      {state.structures.length ? (
        <ol className="mt-4 space-y-3">
          {state.structures.map((structure) => (
            <li
              className="flex flex-wrap items-baseline justify-between gap-3 rounded-lg border border-forest/10 bg-mint/25 px-4 py-3"
              key={structure._id}
            >
              <div>
                <p className="text-sm font-black text-ink">{formatMoney(structure.basicSalary)}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  Effective {formatDate(structure.effectiveFrom)}
                  {structure.effectiveTo ? ` — ${formatDate(structure.effectiveTo)}` : ""}
                </p>
              </div>
              <span
                className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                  structure.status === "ACTIVE"
                    ? "bg-green-50 text-green-800 ring-green-200"
                    : "bg-slate-50 text-slate-700 ring-slate-200"
                }`}
              >
                {structure.status === "ACTIVE" ? "Current" : "Superseded"}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
