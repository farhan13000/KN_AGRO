import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { usePromotionList } from "../hooks";
import PromotionCard from "./PromotionCard";

/**
 * Every promotion ever raised for one employee, any status. Read-only —
 * approve/reject/cancel all live where the actor is acting on a queue,
 * not on a profile page.
 */
export default function PromotionHistorySection({ employeeId }) {
  const state = usePromotionList({ employee: employeeId }, { enabled: Boolean(employeeId) });

  if (state.isError) {
    return <ErrorState message={state.errorMessage} title="Unable to load promotion history" />;
  }

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-ink">Promotion History</h2>
      <p className="mt-1 text-sm text-muted">
        Every promotion raised for this employee, newest first.
      </p>

      {state.isLoading ? (
        <p className="mt-4 text-sm font-semibold text-muted">Loading promotion history...</p>
      ) : null}

      {!state.isLoading && !state.promotions.length ? (
        <div className="mt-4">
          <EmptyState
            description="No promotion has been raised for this employee yet."
            title="No promotions recorded"
          />
        </div>
      ) : null}

      {state.promotions.length ? (
        <ul className="mt-5 space-y-3">
          {state.promotions.map((promotion) => (
            <PromotionCard key={promotion._id} promotion={promotion} showEmployee={false} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
