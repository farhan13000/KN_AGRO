import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Textarea from "../../../shared/forms/Textarea";
import { useEmployeePerformanceRow, usePromotionActions } from "../hooks";

const Metric = ({ label, value }) => (
  <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-forest/10">
    <p className="text-[0.65rem] font-black uppercase tracking-wide text-muted">{label}</p>
    <p className="mt-0.5 text-sm font-black text-ink">{value}</p>
  </div>
);

/**
 * Approve or reject one promotion. The comment is optional when
 * approving but REQUIRED when rejecting, matching the backend's
 * rejectPromotionSchema (min 1 char) — validated here so the user gets
 * the message before a round-trip, and again by the server regardless.
 *
 * Holding PROMOTION_APPROVE/REJECT company-wide doesn't mean this
 * particular promotion is yours to decide: the backend also requires the
 * configured approver tier for this exact role pair AND that you manage
 * the employee. That 403 renders inline here.
 */
export default function PromotionDecisionDialog({ decision, isOpen, onClose, onSuccess, promotion }) {
  const [comment, setComment] = useState("");
  const [managerDecision, setManagerDecision] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [managerError, setManagerError] = useState("");
  const [formError, setFormError] = useState("");

  const isReject = decision === "reject";
  // A promotion to GM is the only one with nobody above it to report to,
  // so it is the only approval that needs no manager decision — the
  // backend applies the same rule via REQUIRED_MANAGER_ROLE.
  const needsManagerDecision =
    !isReject && String(promotion?.proposedRole?.name || "").toLowerCase() !== "gm";

  const actions = usePromotionActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  const { performance, isLoading: isLoadingPerformance } = useEmployeePerformanceRow(promotion?.employee?._id, {
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setComment("");
      setManagerDecision("");
      setFieldError("");
      setManagerError("");
      setFormError("");
    }
  }, [isOpen, decision]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (isReject && !comment.trim()) {
      setFieldError("A comment is required when rejecting.");
      return;
    }
    setFieldError("");

    if (needsManagerDecision && !managerDecision) {
      setManagerError("Choose who will manage this employee after the promotion.");
      return;
    }
    setManagerError("");

    try {
      if (isReject) {
        await actions.rejectPromotion.mutate(promotion._id, comment.trim());
      } else {
        await actions.approvePromotion.mutate(
          promotion._id,
          comment.trim(),
          needsManagerDecision ? managerDecision : undefined,
        );
      }
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const isBusy = actions.approvePromotion.isLoading || actions.rejectPromotion.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReject ? "Reject promotion" : "Approve promotion"}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          {promotion?.employee?.user?.name || promotion?.employee?.employeeCode || "This employee"}:{" "}
          {promotion?.currentRole?.name?.toUpperCase() || "—"} →{" "}
          {promotion?.proposedRole?.name?.toUpperCase() || "—"}
          {promotion?.recommendedBy?.name ? ` — recommended by ${promotion.recommendedBy.name}` : null}
        </p>

        <section className="rounded-lg border border-forest/15 p-4">
          <h3 className="text-sm font-black text-ink">Performance</h3>
          {isLoadingPerformance ? (
            <p className="mt-2 text-sm text-muted">Loading performance…</p>
          ) : performance ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Metric label="Leads" value={performance.assignedLeads} />
              <Metric label="Converted" value={performance.convertedLeads} />
              <Metric label="Conversion" value={`${performance.conversionRate}%`} />
              <Metric label="Orders" value={performance.orders} />
              <Metric label="Present Days" value={performance.attendanceSummary?.presentDays ?? 0} />
              <Metric label="Overdue Follow-Ups" value={performance.overdueFollowUps} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              No performance data is recorded for this employee yet.
            </p>
          )}
        </section>

        {needsManagerDecision ? (
          <fieldset className="rounded-lg border border-forest/15 p-4">
            <legend className="px-1 text-sm font-black text-ink">
              Who will manage them after the promotion?
            </legend>
            <p className="mt-1 text-xs text-muted">
              Required. The role change is applied once a manager is settled, so the employee is never
              left reporting to the wrong tier.
            </p>

            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm">
              <input
                checked={managerDecision === "SELF"}
                className="mt-1"
                name="promotion-manager-decision"
                onChange={() => setManagerDecision("SELF")}
                type="radio"
                value="SELF"
              />
              <span>
                <span className="font-bold text-ink">I will manage them</span>
                <span className="block text-xs text-muted">
                  They report to you, and the promotion completes now.
                </span>
              </span>
            </label>

            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm">
              <input
                checked={managerDecision === "ESCALATE"}
                className="mt-1"
                name="promotion-manager-decision"
                onChange={() => setManagerDecision("ESCALATE")}
                type="radio"
                value="ESCALATE"
              />
              <span>
                <span className="font-bold text-ink">Pass it to my manager</span>
                <span className="block text-xs text-muted">
                  They pick the manager. If you have nobody above you, it goes to the admins instead. The
                  promotion stays pending until it is settled.
                </span>
              </span>
            </label>

            {managerError ? (
              <p className="mt-3 text-sm font-semibold text-red-800">{managerError}</p>
            ) : null}
          </fieldset>
        ) : null}

        <Textarea
          error={fieldError}
          id="promotion-decision-comment"
          label={isReject ? "Comment (required)" : "Comment (optional)"}
          maxLength={1000}
          name="comment"
          onChange={(event) => setComment(event.target.value)}
          required={isReject}
          value={comment}
        />

        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
              isReject ? "bg-red-700 hover:bg-red-800" : "bg-forest hover:bg-agriculture"
            }`}
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? "Saving..." : isReject ? "Reject Promotion" : "Approve Promotion"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
