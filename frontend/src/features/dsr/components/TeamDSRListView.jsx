import { useState } from "react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS } from "../../../shared/constants";
import { DSR_STATUS } from "../constants";
import { useDSRActions, useTeamDSRList } from "../hooks";
import DSRCard from "./DSRCard";
import DSRReviewDialog from "./DSRReviewDialog";

/**
 * Review and Acknowledge are two SEPARATE actions (SUBMITTED -> REVIEWED
 * -> ACKNOWLEDGED), each rendered only when both DSR_REVIEW is held AND
 * the row's current status allows that transition — but the backend's own
 * canManageEmployee / "not your own DSR" / "same reviewer can't also
 * acknowledge" checks are the real gate; a 403 here is an expected,
 * explainable outcome for a permitted-but-out-of-chain actor, not a bug.
 */
export default function TeamDSRListView({ description, portalLabel, showHeading = true }) {
  const { hasPermission } = useAuth();
  const [reviewing, setReviewing] = useState(null);
  const [acknowledging, setAcknowledging] = useState(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const state = useTeamDSRList();
  const actions = useDSRActions();
  const canReview = hasPermission(PERMISSIONS.DSR_REVIEW);

  const closeAndRefresh = async (text) => {
    setReviewing(null);
    setAcknowledging(null);
    if (text) setMessage(text);
    setActionError("");
    await state.refetch();
  };

  const runAcknowledge = async () => {
    if (!acknowledging) return;
    setActionError("");
    try {
      await actions.acknowledgeDSR.mutate(acknowledging._id);
      await closeAndRefresh("DSR acknowledged.");
    } catch (error) {
      setAcknowledging(null);
      setActionError(getApiErrorMessage(error));
    }
  };

  const actionsFor = (dsr) => {
    if (!canReview) return null;
    if (dsr.status === DSR_STATUS.SUBMITTED) {
      return (
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
          onClick={() => setReviewing(dsr)}
          type="button"
        >
          Review
        </button>
      );
    }
    if (dsr.status === DSR_STATUS.REVIEWED) {
      return (
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
          onClick={() => setAcknowledging(dsr)}
          type="button"
        >
          Acknowledge
        </button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Team Daily Sales Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-forest/15 bg-mint/60 px-4 py-3 text-sm font-semibold text-forest">{message}</p>
      ) : null}
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{actionError}</p>
      ) : null}

      {state.isLoading ? <PageLoader message="Loading team DSRs..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load team DSRs" /> : null}
      {!state.isLoading && !state.isError && !state.dsrs.length ? (
        <EmptyState description="No DSRs from your team yet." title="No DSRs found" />
      ) : null}

      {state.dsrs.length ? (
        <ul className="space-y-3">
          {state.dsrs.map((dsr) => (
            <DSRCard actions={actionsFor(dsr)} dsr={dsr} key={dsr._id} showEmployee />
          ))}
        </ul>
      ) : null}

      <DSRReviewDialog
        dsr={reviewing}
        isOpen={Boolean(reviewing)}
        onClose={() => setReviewing(null)}
        onSuccess={() => closeAndRefresh("DSR reviewed.")}
      />

      <ConfirmDialog
        confirmDisabled={actions.acknowledgeDSR.isLoading}
        confirmLabel="Acknowledge"
        description="This marks the DSR ACKNOWLEDGED — the final step in the review chain."
        isOpen={Boolean(acknowledging)}
        onCancel={() => setAcknowledging(null)}
        onConfirm={runAcknowledge}
        title="Acknowledge DSR"
      />
    </div>
  );
}
