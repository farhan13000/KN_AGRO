import { useState } from "react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ALL_PERMISSIONS, PERMISSIONS } from "../../../shared/constants";
import {
  SALARY_PROPOSAL_REJECT_STAGE_ROLES,
  SALARY_PROPOSAL_STAGE_ROLES,
  SALARY_PROPOSAL_STATUS,
  SALARY_PROPOSAL_STATUS_LABELS,
} from "../constants";
import { useSalaryProposalActions, useSalaryProposalList } from "../hooks";
import SalaryProposalCard from "./SalaryProposalCard";
import SalaryProposalDecisionDialog from "./SalaryProposalDecisionDialog";

/**
 * Everything across the whole pipeline, status-filterable (Prompt 8.2's
 * own requirement — unlike Promotion's single-status PendingApprovalsView,
 * a salary proposal has three distinct actionable stages at once:
 * RECOMMENDED needs a GM review, REVIEWED needs an SA approve/reject,
 * APPROVED needs an SA finalize). A row's action set renders only when
 * BOTH the actor's permission AND their role tier AND the row's current
 * status allow that transition — the backend stays authoritative if the
 * two ever disagree.
 *
 * Approve/Finalize need no dialog (the backend accepts no body for
 * either) so they run immediately on click, mirroring exactly how
 * HiringPipelineView's own Approve step has no confirmation step either.
 */
export default function SalaryProposalPipelineView({ description, portalLabel }) {
  const { hasPermission, role } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [decision, setDecision] = useState(null); // { proposal, kind: "review" | "reject" }
  const [confirming, setConfirming] = useState(null); // { proposal, kind: "approve" | "finalize" }
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const state = useSalaryProposalList(statusFilter ? { status: statusFilter } : {});
  const actions = useSalaryProposalActions();

  const isWildcard = hasPermission(ALL_PERMISSIONS);
  const atTier = (roles) => isWildcard || roles.includes(role);

  const closeAndRefresh = async (text) => {
    setDecision(null);
    setConfirming(null);
    if (text) setMessage(text);
    setActionError("");
    await state.refetch();
  };

  const runConfirm = async () => {
    if (!confirming) return;
    setActionError("");
    try {
      if (confirming.kind === "approve") {
        await actions.approveSalaryProposal.mutate(confirming.proposal._id);
        await closeAndRefresh("Salary proposal approved.");
      } else {
        await actions.finalizeSalaryProposal.mutate(confirming.proposal._id);
        await closeAndRefresh("Salary proposal finalized — the new structure is now live.");
      }
    } catch (error) {
      setConfirming(null);
      setActionError(getApiErrorMessage(error));
    }
  };

  const actionsFor = (proposal) => {
    const buttons = [];
    const status = proposal.approvalStatus;

    if (
      status === SALARY_PROPOSAL_STATUS.RECOMMENDED &&
      hasPermission(PERMISSIONS.SALARY_PROPOSAL_RECOMMEND) &&
      atTier(SALARY_PROPOSAL_STAGE_ROLES.REVIEW)
    ) {
      buttons.push({ key: "review", label: "Review", onClick: () => setDecision({ kind: "review", proposal }) });
    }

    if (
      status === SALARY_PROPOSAL_STATUS.REVIEWED &&
      hasPermission(PERMISSIONS.SALARY_PROPOSAL_APPROVE) &&
      atTier(SALARY_PROPOSAL_STAGE_ROLES.APPROVE)
    ) {
      buttons.push({
        key: "approve",
        label: "Approve",
        primary: true,
        onClick: () => setConfirming({ kind: "approve", proposal }),
      });
    }

    if (
      status === SALARY_PROPOSAL_STATUS.APPROVED &&
      hasPermission(PERMISSIONS.SALARY_PROPOSAL_FINALIZE) &&
      atTier(SALARY_PROPOSAL_STAGE_ROLES.FINALIZE)
    ) {
      buttons.push({
        key: "finalize",
        label: "Finalize",
        primary: true,
        onClick: () => setConfirming({ kind: "finalize", proposal }),
      });
    }

    const rejectOwner = SALARY_PROPOSAL_REJECT_STAGE_ROLES[status];
    if (rejectOwner && hasPermission(PERMISSIONS.SALARY_PROPOSAL_RECOMMEND) && (isWildcard || role === rejectOwner)) {
      buttons.push({ key: "reject", label: "Reject", danger: true, onClick: () => setDecision({ kind: "reject", proposal }) });
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Salary Proposals</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>

      {message ? (
        <p className="rounded-lg border border-forest/15 bg-mint/60 px-4 py-3 text-sm font-semibold text-forest">
          {message}
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {actionError}
        </p>
      ) : null}

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <label className="block max-w-xs">
          <span className="form-label">Status</span>
          <select
            className="form-field"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="">All statuses</option>
            {Object.values(SALARY_PROPOSAL_STATUS).map((status) => (
              <option key={status} value={status}>
                {SALARY_PROPOSAL_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {state.isLoading ? <PageLoader message="Loading salary proposals..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load salary proposals" /> : null}
      {!state.isLoading && !state.isError && !state.proposals.length ? (
        <EmptyState description="No salary proposals match this filter." title="No salary proposals" />
      ) : null}

      {state.proposals.length ? (
        <ul className="space-y-3">
          {state.proposals.map((proposal) => {
            const buttons = actionsFor(proposal);
            return (
              <SalaryProposalCard
                actions={
                  buttons.length ? (
                    <div className="flex flex-wrap gap-3">
                      {buttons.map((button) => (
                        <button
                          className={
                            button.danger
                              ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                              : button.primary
                                ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                                : "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
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
                key={proposal._id}
                proposal={proposal}
              />
            );
          })}
        </ul>
      ) : null}

      <SalaryProposalDecisionDialog
        decision={decision?.kind}
        isOpen={Boolean(decision)}
        onClose={() => setDecision(null)}
        onSuccess={() =>
          closeAndRefresh(decision?.kind === "reject" ? "Salary proposal rejected." : "Salary proposal reviewed.")
        }
        proposal={decision?.proposal}
      />

      <ConfirmDialog
        confirmDisabled={actions.approveSalaryProposal.isLoading || actions.finalizeSalaryProposal.isLoading}
        confirmLabel={confirming?.kind === "finalize" ? "Finalize" : "Approve"}
        description={
          confirming?.kind === "finalize"
            ? "This creates a new, live SalaryStructure for this employee effective the proposal's date. This cannot be undone."
            : "This marks the proposal approved and awaiting finalization. It does not change the employee's salary yet."
        }
        isOpen={Boolean(confirming)}
        onCancel={() => setConfirming(null)}
        onConfirm={runConfirm}
        title={confirming?.kind === "finalize" ? "Finalize salary proposal" : "Approve salary proposal"}
      />
    </div>
  );
}
