import { useState } from "react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import { ALL_PERMISSIONS, PERMISSIONS } from "../../../shared/constants";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import { employeeOptionLabel } from "../../employees/utils/employeeFormatters";
import { DISTRICT_ASSIGNMENT_STATUS, DISTRICT_ASSIGNMENT_STATUS_LABELS, DISTRICT_FINALIZE_ROLES, DISTRICT_REVIEW_ROLES } from "../constants";
import { useAssignmentCandidates, useDistrictActions } from "../hooks";
import { matchesDistrictTier } from "../utils";

export default function DistrictAssignmentPanel({ district, onRefresh }) {
  const { hasPermission, role } = useAuth();
  const [proposedRM, setProposedRM] = useState("");
  const [proposedASM, setProposedASM] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [actionError, setActionError] = useState("");

  const canAssign = hasPermission(PERMISSIONS.DISTRICT_ASSIGN);
  const isWildcard = hasPermission(ALL_PERMISSIONS);
  const canReview = matchesDistrictTier(role, isWildcard, DISTRICT_REVIEW_ROLES);
  const canFinalize = matchesDistrictTier(role, isWildcard, DISTRICT_FINALIZE_ROLES);

  // Candidate pickers only need to load once an actor can actually
  // propose something — no point paging through every employee for a
  // read-only viewer.
  const candidatesState = useAssignmentCandidates({ enabled: canAssign });
  const { asmCandidates, employees, rmCandidates } = candidatesState;
  // The backend doesn't populate assignedRM/assignedASM/pendingAssignment's
  // employee refs (see district.service.js's getDistrictById — only
  // `region` is populated), so names are resolved client-side from the
  // same candidate list already being fetched for the picker below.
  const nameFor = (employeeId) => {
    if (!employeeId) return null;
    const match = employees.find((e) => e._id === employeeId);
    if (match) return employeeOptionLabel(match);
    // The candidate list is what resolves ids to names, and it is only
    // fetched for actors who can propose an assignment — so a viewer
    // without that right gets a plain marker rather than a raw ObjectId or
    // a "Loading..." that would never resolve.
    if (!canAssign) return "Assigned";
    if (candidatesState.isLoading) return "Loading...";
    return employeeId;
  };

  const clearFormState = () => {
    setProposedRM("");
    setProposedASM("");
    setReviewComment("");
    setActionError("");
  };

  const actions = useDistrictActions({
    onSuccess: async () => {
      clearFormState();
      await onRefresh?.();
    },
  });

  const runAction = async (mutateFn, ...args) => {
    setActionError("");
    try {
      await mutateFn(...args);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const hasActiveAssignment = Boolean(district.assignedRM || district.assignedASM);
  const isPending = district.assignmentStatus === DISTRICT_ASSIGNMENT_STATUS.PENDING_APPROVAL;
  const isApproved = district.assignmentStatus === DISTRICT_ASSIGNMENT_STATUS.APPROVED;
  const canProposeNew = !isPending && !isApproved;

  const handlePropose = async (event) => {
    event.preventDefault();
    if (!proposedRM && !proposedASM) {
      setActionError("Select at least an RM or an ASM to propose.");
      return;
    }
    const payload = {
      ...(proposedRM ? { proposedRM } : {}),
      ...(proposedASM ? { proposedASM } : {}),
    };
    const mutate = hasActiveAssignment ? actions.requestReassignment.mutate : actions.requestAssignment.mutate;
    await runAction(mutate, district._id, payload);
  };

  const isBusy =
    actions.requestAssignment.isLoading ||
    actions.requestReassignment.isLoading ||
    actions.reviewAssignment.isLoading ||
    actions.finalizeAssignment.isLoading;

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-ink">Manager Assignment</h2>
        {district.assignmentStatus ? (
          <span className="inline-flex items-center rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest ring-1 ring-forest/15">
            {DISTRICT_ASSIGNMENT_STATUS_LABELS[district.assignmentStatus] || district.assignmentStatus}
          </span>
        ) : null}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Regional Manager</dt>
          <dd className="mt-1 font-semibold text-ink">{nameFor(district.assignedRM) || "Not assigned"}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Area Sales Manager</dt>
          <dd className="mt-1 font-semibold text-ink">{nameFor(district.assignedASM) || "Not assigned"}</dd>
        </div>
      </dl>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          {actionError}
        </p>
      ) : null}

      {(isPending || isApproved) && district.pendingAssignment ? (
        <div className="space-y-4 rounded-lg border border-forest/10 bg-mint/40 p-4">
          <p className="text-sm font-semibold text-forest">
            {isPending ? "Pending review" : "Approved — awaiting Super Admin finalization"}
          </p>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-black uppercase tracking-wide text-muted">Proposed RM</dt>
              <dd className="mt-1 text-ink">{nameFor(district.pendingAssignment.proposedRM) || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase tracking-wide text-muted">Proposed ASM</dt>
              <dd className="mt-1 text-ink">{nameFor(district.pendingAssignment.proposedASM) || "—"}</dd>
            </div>
          </dl>

          {isPending && canReview ? (
            <div className="space-y-3">
              <Textarea
                id="district-review-comment"
                label="Comment (optional)"
                name="reviewComment"
                onChange={(event) => setReviewComment(event.target.value)}
                value={reviewComment}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  disabled={isBusy}
                  onClick={() => runAction(actions.reviewAssignment.mutate, district._id, { approve: true, comment: reviewComment })}
                  type="button"
                >
                  Approve
                </Button>
                <Button
                  disabled={isBusy}
                  onClick={() => runAction(actions.reviewAssignment.mutate, district._id, { approve: false, comment: reviewComment })}
                  type="button"
                  variant="secondary"
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : null}

          {isApproved && canFinalize ? (
            <Button
              disabled={isBusy}
              onClick={() => runAction(actions.finalizeAssignment.mutate, district._id)}
              type="button"
            >
              Finalize Assignment
            </Button>
          ) : null}

          {!(isPending && canReview) && !(isApproved && canFinalize) ? (
            <p className="text-sm text-muted">
              {isPending
                ? "Awaiting review by a General Manager or Office Admin."
                : "Awaiting finalization by the Super Admin."}
            </p>
          ) : null}
        </div>
      ) : null}

      {canProposeNew && canAssign ? (
        <form className="space-y-4 border-t border-forest/10 pt-4" onSubmit={handlePropose}>
          <p className="text-sm font-semibold text-ink">
            {hasActiveAssignment ? "Propose a reassignment" : "Propose a manager assignment"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="proposed-rm"
              label="Regional Manager"
              name="proposedRM"
              onChange={(event) => setProposedRM(event.target.value)}
              options={[
                { value: "", label: "No change" },
                ...rmCandidates.map((candidate) => ({ value: candidate._id, label: employeeOptionLabel(candidate) })),
              ]}
              value={proposedRM}
            />
            <Select
              id="proposed-asm"
              label="Area Sales Manager"
              name="proposedASM"
              onChange={(event) => setProposedASM(event.target.value)}
              options={[
                { value: "", label: "No change" },
                ...asmCandidates.map((candidate) => ({ value: candidate._id, label: employeeOptionLabel(candidate) })),
              ]}
              value={proposedASM}
            />
          </div>
          {candidatesState.isError ? (
            <p className="text-sm font-semibold text-red-800">{candidatesState.errorMessage}</p>
          ) : null}
          <Button disabled={isBusy} type="submit">
            {isBusy ? "Submitting..." : hasActiveAssignment ? "Propose Reassignment" : "Propose Assignment"}
          </Button>
        </form>
      ) : null}

      {!canProposeNew && !canAssign ? (
        <p className="text-sm text-muted">You do not have permission to act on this district's assignment.</p>
      ) : null}
    </Card>
  );
}
