import { useState } from "react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PROMOTION_STATUS } from "../constants";
import { usePromotionList } from "../hooks";
import PromotionCard from "./PromotionCard";
import PromotionDecisionDialog from "./PromotionDecisionDialog";

/**
 * Everything currently awaiting a decision.
 *
 * Deliberately NOT filtered client-side to "promotions I can approve":
 * the backend's list endpoint isn't actor-scoped, and guessing here
 * would only ever hide rows a user might legitimately act on. The real
 * gate is the per-action 403, which the decision dialog shows inline —
 * so an actor may see a row they can't decide, and gets told why when
 * they try.
 */
export default function PendingApprovalsView({ description, portalLabel, showHeading = true }) {
  const [decision, setDecision] = useState(null); // { promotion, kind }
  const [message, setMessage] = useState("");

  const state = usePromotionList({ status: PROMOTION_STATUS.RECOMMENDED });

  const closeAndRefresh = async (text) => {
    setDecision(null);
    if (text) setMessage(text);
    await state.refetch();
  };

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Promotion Approvals</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-forest/15 bg-mint/60 px-4 py-3 text-sm font-semibold text-forest">
          {message}
        </p>
      ) : null}

      {state.isLoading ? <PageLoader message="Loading promotions awaiting approval..." /> : null}
      {state.isError ? (
        <ErrorState message={state.errorMessage} title="Unable to load promotions" />
      ) : null}
      {!state.isLoading && !state.isError && !state.promotions.length ? (
        <EmptyState
          description="Nothing is currently awaiting a promotion decision."
          title="No pending promotions"
        />
      ) : null}

      {state.promotions.length ? (
        <ul className="space-y-3">
          {state.promotions.map((promotion) => (
            <PromotionCard
              actions={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                    onClick={() => setDecision({ kind: "approve", promotion })}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                    onClick={() => setDecision({ kind: "reject", promotion })}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              }
              key={promotion._id}
              promotion={promotion}
            />
          ))}
        </ul>
      ) : null}

      <PromotionDecisionDialog
        decision={decision?.kind}
        isOpen={Boolean(decision)}
        onClose={() => setDecision(null)}
        onSuccess={() =>
          closeAndRefresh(
            decision?.kind === "reject" ? "Promotion rejected." : "Promotion approved and completed.",
          )
        }
        promotion={decision?.promotion}
      />
    </div>
  );
}
