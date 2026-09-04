import { useState } from "react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ALL_PERMISSIONS, PERMISSIONS } from "../../../shared/constants";
import { AuditTrailToggle } from "../../audit";
import {
  HIRING_REJECT_STAGE_ROLES,
  HIRING_STAGE_ROLES,
  HIRING_STATUS,
  HIRING_STATUS_LABELS,
} from "../constants";
import { useHiringActions, useHiringRequestList } from "../hooks";
import HiringCompleteDialog from "./HiringCompleteDialog";
import HiringStatusBadge from "./HiringStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString();
};

/**
 * A step button renders only when BOTH the actor's permission allows it
 * AND the request's status allows that transition — but the backend stays
 * authoritative: if the two ever disagree, its 400/403 is what the user
 * sees, rendered inline rather than swallowed.
 */
export default function HiringPipelineView({ createHref, description, portalLabel }) {
  const { hasPermission, role } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [completing, setCompleting] = useState(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const state = useHiringRequestList(statusFilter ? { status: statusFilter } : {});
  const actions = useHiringActions();

  const isWildcard = hasPermission(ALL_PERMISSIONS);
  const atTier = (roles) => isWildcard || roles.includes(role);

  const run = async (mutate, successText, ...args) => {
    setActionError("");
    try {
      await mutate(...args);
      setMessage(successText);
      await state.refetch();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const stepsFor = (request) => {
    const steps = [];
    const status = request.status;

    if (status === HIRING_STATUS.REQUESTED && hasPermission(PERMISSIONS.HIRING_RECOMMEND) && atTier(HIRING_STAGE_ROLES.PROCESS)) {
      steps.push({
        label: "Process",
        run: () => run(actions.processHiringRequest.mutate, "Request moved to processing.", request._id, ""),
      });
    }
    if (status === HIRING_STATUS.PROCESSING && hasPermission(PERMISSIONS.HIRING_RECOMMEND) && atTier(HIRING_STAGE_ROLES.REVIEW)) {
      steps.push({
        label: "Review",
        run: () => run(actions.reviewHiringRequest.mutate, "Request moved to review.", request._id, ""),
      });
    }
    if (status === HIRING_STATUS.UNDER_REVIEW && hasPermission(PERMISSIONS.HIRING_APPROVE) && atTier(HIRING_STAGE_ROLES.APPROVE)) {
      steps.push({
        label: "Approve",
        run: () => run(actions.approveHiringRequest.mutate, "Request approved.", request._id),
      });
    }
    if (status === HIRING_STATUS.APPROVED && hasPermission(PERMISSIONS.HIRING_CREATE) && atTier(HIRING_STAGE_ROLES.COMPLETE)) {
      steps.push({ label: "Complete Hire", run: () => setCompleting(request), primary: true });
    }

    // Reject only exists while the backend has a stage owner for this status.
    const rejectOwner = HIRING_REJECT_STAGE_ROLES[status];
    if (rejectOwner && hasPermission(PERMISSIONS.HIRING_REJECT) && (isWildcard || role === rejectOwner)) {
      steps.push({
        danger: true,
        label: "Reject",
        run: () => {
          const reason = window.prompt("Reason for rejecting this hiring request:");
          if (!reason || !reason.trim()) return undefined;
          return run(actions.rejectHiringRequest.mutate, "Request rejected.", request._id, reason.trim());
        },
      });
    }

    return steps;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Hiring Requests</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
        {createHref && hasPermission(PERMISSIONS.HIRING_CREATE) ? (
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            href={createHref}
          >
            Request Hire
          </a>
        ) : null}
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
            {Object.values(HIRING_STATUS).map((status) => (
              <option key={status} value={status}>
                {HIRING_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {state.isLoading ? <PageLoader message="Loading hiring requests..." /> : null}
      {state.isError ? <ErrorState message={state.errorMessage} title="Unable to load hiring requests" /> : null}
      {!state.isLoading && !state.isError && !state.requests.length ? (
        <EmptyState description="No hiring requests match this filter." title="No hiring requests" />
      ) : null}

      {state.requests.length ? (
        <ul className="space-y-3">
          {state.requests.map((request) => {
            const steps = stepsFor(request);
            return (
              <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm" key={request._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-ink">{request.candidate?.name}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">
                      {request.candidate?.email} · {request.candidate?.phone}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      <span className="font-semibold text-ink">
                        {request.proposedRole?.name?.toUpperCase() || "—"}
                      </span>
                      {request.proposedRegion?.name ? ` · ${request.proposedRegion.name}` : ""}
                      {request.proposedDistrict?.name ? ` / ${request.proposedDistrict.name}` : ""}
                      {request.proposedManager?.user?.name
                        ? ` · reports to ${request.proposedManager.user.name}`
                        : ""}
                    </p>
                  </div>
                  <HiringStatusBadge status={request.status} />
                </div>

                <p className="mt-3 text-xs font-semibold text-muted">
                  {request.requestedBy?.name ? `Requested by ${request.requestedBy.name}` : null}
                  {formatDate(request.createdAt) ? ` on ${formatDate(request.createdAt)}` : null}
                </p>
                {request.rejectionReason ? (
                  <p className="mt-2 text-sm text-red-800">Rejected: {request.rejectionReason}</p>
                ) : null}

                {steps.length ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {steps.map((step) => (
                      <button
                        className={
                          step.danger
                            ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50"
                            : step.primary
                              ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
                              : "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        }
                        key={step.label}
                        onClick={step.run}
                        type="button"
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {hasPermission(PERMISSIONS.AUDIT_READ) ? (
                  <AuditTrailToggle entityId={request._id} entityType="HiringRequest" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <HiringCompleteDialog
        isOpen={Boolean(completing)}
        onClose={() => setCompleting(null)}
        onSuccess={async () => {
          setCompleting(null);
          setMessage("Employee account created. The new hire can now sign in.");
          await state.refetch();
        }}
        request={completing}
      />
    </div>
  );
}
