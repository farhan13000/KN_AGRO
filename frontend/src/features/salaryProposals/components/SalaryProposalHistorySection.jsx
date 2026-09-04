import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { useSalaryProposalList } from "../hooks";
import SalaryProposalCard from "./SalaryProposalCard";

/**
 * Every salary proposal ever raised for one employee, any status.
 * Read-only — review/approve/reject/finalize all live on the pipeline
 * view, where the actor is acting on a queue, not on a profile page.
 */
export default function SalaryProposalHistorySection({ employeeId }) {
  const state = useSalaryProposalList({ employee: employeeId }, { enabled: Boolean(employeeId) });

  if (state.isError) {
    return <ErrorState message={state.errorMessage} title="Unable to load salary proposal history" />;
  }

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Salary Proposal History</h2>
      <p className="mt-1 text-sm text-muted">Every salary change proposed for this employee, newest first.</p>

      {state.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading salary proposal history...</p> : null}

      {!state.isLoading && !state.proposals.length ? (
        <div className="mt-4">
          <EmptyState description="No salary change has been proposed for this employee yet." title="No proposals recorded" />
        </div>
      ) : null}

      {state.proposals.length ? (
        <ul className="mt-5 space-y-3">
          {state.proposals.map((proposal) => (
            <SalaryProposalCard key={proposal._id} proposal={proposal} showEmployee={false} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
