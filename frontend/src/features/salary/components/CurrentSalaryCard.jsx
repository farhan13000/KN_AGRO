import ErrorState from "../../../shared/components/ErrorState";
import { formatMoney } from "../../../shared/utils";
import { useCurrentSalaryStructure } from "../hooks";

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

/**
 * Read-only "current salary" display — this codebase had no frontend for
 * the existing (pre-migration) SalaryStructure module at all before Phase
 * F08, even though the backend endpoint has been live and correct since
 * before this migration started. Built as a minimal prerequisite: Prompt
 * 8.1 asks for the proposal-creation dialog to show current salary "pulled
 * from the employee's existing SalaryStructure display, wherever that
 * already renders" — nowhere did, so this is that display's first render,
 * kept deliberately narrow (no create/edit — SALARY_MANAGE stays
 * out of this phase's scope).
 */
export default function CurrentSalaryCard({ employeeId }) {
  const state = useCurrentSalaryStructure(employeeId);

  if (state.isError) {
    return <ErrorState message={state.errorMessage} title="Unable to load current salary" />;
  }

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Current Salary</h2>

      {state.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading...</p> : null}

      {!state.isLoading && !state.salaryStructure ? (
        <p className="mt-3 text-sm text-muted">No salary structure has been set for this employee yet.</p>
      ) : null}

      {state.salaryStructure ? (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-muted">Basic Salary</p>
            <p className="mt-1 text-2xl font-black text-ink">{formatMoney(state.salaryStructure.basicSalary)}</p>
          </div>
          {formatDate(state.salaryStructure.effectiveFrom) ? (
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-muted">Effective From</p>
              <p className="mt-1 text-sm font-semibold text-ink">{formatDate(state.salaryStructure.effectiveFrom)}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
