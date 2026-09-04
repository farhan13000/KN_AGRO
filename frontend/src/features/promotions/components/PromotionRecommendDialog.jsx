import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import { getEmployeeDisplayName } from "../../employees/utils/employeeFormatters";
import { usePromotionActions, useRoleOptions } from "../hooks";

/**
 * Recommending is gated by PROMOTION_RECOMMEND, but that permission is
 * necessary-not-sufficient: the backend also checks the actor's role tier
 * against the approver matrix and that they actually manage this
 * employee. A 403 here is therefore an expected outcome for a valid user,
 * so it renders inline as an explanation rather than as a crash.
 */
export default function PromotionRecommendDialog({ employee, isOpen, onClose, onSuccess }) {
  const [proposedRoleId, setProposedRoleId] = useState("");
  const [reason, setReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const roleState = useRoleOptions({ enabled: isOpen });
  const actions = usePromotionActions({
    onSuccess: async () => {
      await onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setProposedRoleId("");
      setReason("");
      setFieldErrors({});
      setFormError("");
    }
  }, [isOpen]);

  const currentRoleName = employee?.user?.role?.name;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    if (!proposedRoleId) errors.proposedRoleId = "Choose the role to promote into.";
    if (!reason.trim()) errors.reason = "A reason is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await actions.recommendPromotion.mutate(employee._id, proposedRoleId, reason.trim());
      onClose();
    } catch (error) {
      // Covers both the tier-skip 400 ("No configured promotion path from
      // X to Y") and the out-of-chain 403 — the backend's own wording is
      // more useful than anything invented here.
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Recommend ${getEmployeeDisplayName(employee)} for promotion`}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Current role: {currentRoleName ? currentRoleName.toUpperCase() : "Unknown"}. Your
          recommendation goes to the approver configured for this tier.
        </p>

        <Select
          error={fieldErrors.proposedRoleId}
          id="promotion-proposed-role"
          label="Promote To"
          name="proposedRoleId"
          onChange={(event) => setProposedRoleId(event.target.value)}
          options={[
            { value: "", label: roleState.isLoading ? "Loading roles..." : "Select a role" },
            ...roleState.roles.map((role) => ({ value: role._id, label: role.name.toUpperCase() })),
          ]}
          required
          value={proposedRoleId}
        />

        <Textarea
          error={fieldErrors.reason}
          id="promotion-reason"
          label="Reason"
          maxLength={1000}
          name="reason"
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
        />

        {roleState.isError ? (
          <p className="text-sm font-semibold text-red-800">{roleState.errorMessage}</p>
        ) : null}
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
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
            disabled={actions.recommendPromotion.isLoading}
            type="submit"
          >
            {actions.recommendPromotion.isLoading ? "Submitting..." : "Submit Recommendation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
