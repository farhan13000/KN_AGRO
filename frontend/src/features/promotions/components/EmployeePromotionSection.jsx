import { useState } from "react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { PERMISSIONS } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { PROMOTION_NON_TERMINAL_STATUSES } from "../constants";
import { usePromotionList } from "../hooks";
import PromotionCard from "./PromotionCard";
import PromotionDecisionDialog from "./PromotionDecisionDialog";
import PromotionRecommendDialog from "./PromotionRecommendDialog";

/**
 * Promotions for one person, where their manager is already looking at
 * them — recommend from here, and decide from here if you may.
 *
 * PromotionHistorySection stays read-only and stays where it is; this is
 * the actionable version for a team page. Both buttons render on the
 * permission alone: whether THIS actor may recommend or decide for THIS
 * employee is the approver matrix's call, in the backend, and its 403 is
 * shown inline by the dialogs rather than guessed at here.
 */
export default function EmployeePromotionSection({ employee, employeeId }) {
  const { hasPermission } = useAuth();
  const [recommending, setRecommending] = useState(false);
  const [decision, setDecision] = useState(null); // { promotion, kind }
  const [message, setMessage] = useState("");

  const canRecommend = hasPermission(PERMISSIONS.PROMOTION_RECOMMEND);
  const canApprove = hasPermission(PERMISSIONS.PROMOTION_APPROVE);
  const canReject = hasPermission(PERMISSIONS.PROMOTION_REJECT);
  const canRead = hasPermission(PERMISSIONS.PROMOTION_READ);

  const state = usePromotionList(
    { employee: employeeId },
    { enabled: Boolean(employeeId) && canRead },
  );

  if (!canRead && !canRecommend) return null;

  const promotions = state.promotions || [];
  const isOpenStatus = (promotion) => PROMOTION_NON_TERMINAL_STATUSES.includes(promotion.status);

  return (
    <section className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-ink">Promotion</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Recommend this person for the next role, and act on anything already raised for them.
          </p>
        </div>
        {canRecommend ? (
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => setRecommending(true)}
            type="button"
          >
            Recommend for Promotion
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {message}
        </p>
      ) : null}

      {state.isError ? (
        <div className="mt-4">
          <ErrorState message={state.errorMessage} title="Unable to load promotions" />
        </div>
      ) : null}

      {canRead && !state.isLoading && !state.isError && !promotions.length ? (
        <div className="mt-4">
          <EmptyState
            description="No promotion has been raised for this person yet."
            title="No promotions recorded"
          />
        </div>
      ) : null}

      {promotions.length ? (
        <ul className="mt-5 space-y-3">
          {promotions.map((promotion) => (
            <PromotionCard
              actions={
                isOpenStatus(promotion) && (canApprove || canReject) ? (
                  <>
                    {canApprove ? (
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                        onClick={() => setDecision({ promotion, kind: "approve" })}
                        type="button"
                      >
                        Approve
                      </button>
                    ) : null}
                    {canReject ? (
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                        onClick={() => setDecision({ promotion, kind: "reject" })}
                        type="button"
                      >
                        Reject
                      </button>
                    ) : null}
                  </>
                ) : null
              }
              key={promotion._id}
              promotion={promotion}
              showEmployee={false}
            />
          ))}
        </ul>
      ) : null}

      <PromotionRecommendDialog
        employee={employee}
        isOpen={recommending}
        onClose={() => setRecommending(false)}
        onSuccess={async () => {
          setRecommending(false);
          setMessage("Recommended. It now waits on whoever may approve this tier.");
          await state.refetch?.();
        }}
      />

      <PromotionDecisionDialog
        decision={decision?.kind}
        isOpen={Boolean(decision)}
        onClose={() => setDecision(null)}
        onSuccess={async () => {
          setMessage(
            decision?.kind === "reject" ? "Promotion rejected." : "Promotion approved and completed.",
          );
          setDecision(null);
          await state.refetch?.();
        }}
        promotion={decision?.promotion}
      />
    </section>
  );
}
