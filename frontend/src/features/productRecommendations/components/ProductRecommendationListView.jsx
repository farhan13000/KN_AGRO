import { useState } from "react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS } from "../../../shared/constants";
import { RECOMMENDATION_STATUS } from "../constants";
import { useProductRecommendationActions, useProductRecommendationList } from "../hooks";
import ProductRecommendationCard from "./ProductRecommendationCard";
import ProductRecommendationCreateDialog from "./ProductRecommendationCreateDialog";

/**
 * Shared by both the "Manage" and "Recommended for you" pages — there is
 * only ONE list endpoint (GET /product-recommendations), and the backend's
 * own listVisibleTo already returns a different shape depending on who's
 * asking (approval authority sees everything including every DRAFT;
 * everyone else sees only APPROVED + targeted-at-them + their own
 * drafts). This view renders whatever comes back and only decides which
 * ACTIONS to offer, never re-filters the list itself by role/team/area —
 * that would duplicate a rule the backend already enforces.
 */
export default function ProductRecommendationListView({ description, portalLabel }) {
  const { hasPermission, user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [archiving, setArchiving] = useState(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const state = useProductRecommendationList();
  const actions = useProductRecommendationActions();
  const canRecommend = hasPermission(PERMISSIONS.PRODUCTS_RECOMMEND);
  const canApprove = hasPermission(PERMISSIONS.PRODUCTS_MANAGE);

  const closeAndRefresh = async (text) => {
    setCreating(false);
    setArchiving(null);
    if (text) setMessage(text);
    setActionError("");
    await state.refetch();
  };

  const runApprove = async (recommendation) => {
    setActionError("");
    try {
      await actions.approveRecommendation.mutate(recommendation._id);
      await closeAndRefresh("Recommendation approved.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const runArchive = async () => {
    if (!archiving) return;
    setActionError("");
    try {
      await actions.archiveRecommendation.mutate(archiving._id);
      await closeAndRefresh("Recommendation archived.");
    } catch (error) {
      setArchiving(null);
      setActionError(getApiErrorMessage(error));
    }
  };

  const actionsFor = (recommendation) => {
    const buttons = [];
    const isCreator = String(recommendation.recommendedBy?._id || recommendation.recommendedBy) === String(user?._id);

    if (recommendation.status === RECOMMENDATION_STATUS.DRAFT && canApprove) {
      buttons.push({ key: "approve", label: "Approve", primary: true, onClick: () => runApprove(recommendation) });
    }
    if (recommendation.status !== RECOMMENDATION_STATUS.ARCHIVED && (isCreator || canApprove)) {
      buttons.push({ key: "archive", label: "Archive", danger: true, onClick: () => setArchiving(recommendation) });
    }
    return buttons;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Product Recommendations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
        {canRecommend ? (
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            onClick={() => setCreating(true)}
            type="button"
          >
            Recommend a Product
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-lg border border-forest/15 bg-mint/60 px-4 py-3 text-sm font-semibold text-forest">{message}</p>
      ) : null}
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{actionError}</p>
      ) : null}

      {state.isLoading ? <PageLoader message="Loading recommendations..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load recommendations" /> : null}
      {!state.isLoading && !state.isError && !state.recommendations.length ? (
        <EmptyState description="No product recommendations to show yet." title="No recommendations" />
      ) : null}

      {state.recommendations.length ? (
        <ul className="space-y-3">
          {state.recommendations.map((recommendation) => {
            const buttons = actionsFor(recommendation);
            return (
              <ProductRecommendationCard
                actions={
                  buttons.length ? (
                    <div className="flex flex-wrap gap-3">
                      {buttons.map((button) => (
                        <button
                          className={
                            button.danger
                              ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                              : "inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                          }
                          key={button.key}
                          onClick={button.onClick}
                          type="button"
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  ) : null
                }
                key={recommendation._id}
                recommendation={recommendation}
              />
            );
          })}
        </ul>
      ) : null}

      <ProductRecommendationCreateDialog
        isOpen={creating}
        onClose={() => setCreating(false)}
        onSuccess={() => closeAndRefresh("Recommendation created as a draft — approve it to make it visible.")}
      />

      <ConfirmDialog
        confirmDisabled={actions.archiveRecommendation.isLoading}
        confirmLabel="Archive"
        description="This withdraws the recommendation — it will no longer be visible to its target audience."
        isOpen={Boolean(archiving)}
        onCancel={() => setArchiving(null)}
        onConfirm={runArchive}
        title="Archive recommendation"
      />
    </div>
  );
}
