import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import Textarea from "../../../shared/forms/Textarea";
import { MANAGER_TIER_ROLES, normalizeRoleName } from "../../../shared/constants";
import { EMPLOYEE_STATUS, useEmployeeList, employeeOptionLabel } from "../../employees";
import { useDistrictList } from "../../districts";
import { PRODUCT_STATUS, useProductList } from "../../products";
import { useProductRecommendationActions, useRoleOptions } from "../hooks";

const activeProductQuery = Object.freeze({ page: 1, limit: 100, status: PRODUCT_STATUS.ACTIVE, sortBy: "name", sortOrder: "asc" });
const activeEmployeeQuery = Object.freeze({ page: 1, limit: 100, employeeStatus: EMPLOYEE_STATUS.ACTIVE, sortBy: "employeeCode", sortOrder: "asc" });

const getEmployeeRole = (employee) => normalizeRoleName(employee?.user?.role?.name);

/**
 * targetRole/targetTeam/targetArea are three independent, optional
 * dimensions (see the backend's own model comment) — leaving all three
 * blank targets everyone. `targetTeam` is "the manager whose team is
 * targeted," so the picker is narrowed to manager-tier employees, same
 * `MANAGER_TIER_ROLES` reasoning the Lead assignment dialog already uses.
 */
export default function ProductRecommendationCreateDialog({ isOpen, onClose, onSuccess }) {
  const [product, setProduct] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetTeam, setTargetTeam] = useState("");
  const [targetArea, setTargetArea] = useState("");
  const [reason, setReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const productState = useProductList(activeProductQuery, { enabled: isOpen });
  const roleState = useRoleOptions({ enabled: isOpen });
  const employeeState = useEmployeeList(activeEmployeeQuery, { enabled: isOpen });
  const districtState = useDistrictList({ page: 1, limit: 100 }, { enabled: isOpen });
  const actions = useProductRecommendationActions({
    onSuccess: async (recommendation) => {
      await onSuccess?.(recommendation);
    },
  });

  const managerTierEmployees = useMemo(
    () => (employeeState.data?.employees || []).filter((employee) => MANAGER_TIER_ROLES.includes(getEmployeeRole(employee))),
    [employeeState.data],
  );

  useEffect(() => {
    if (isOpen) {
      setProduct("");
      setTargetRole("");
      setTargetTeam("");
      setTargetArea("");
      setReason("");
      setFieldErrors({});
      setFormError("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const errors = {};
    if (!product) errors.product = "Choose a product.";
    if (!reason.trim()) errors.reason = "A reason is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await actions.createRecommendation.mutate({
        product,
        targetRole: targetRole || undefined,
        targetTeam: targetTeam || undefined,
        targetArea: targetArea || undefined,
        reason: reason.trim(),
      });
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recommend a product">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          error={fieldErrors.product}
          id="recommendation-product"
          label="Product"
          name="product"
          onChange={(event) => setProduct(event.target.value)}
          options={[
            { value: "", label: productState.isLoading ? "Loading products..." : "Select a product" },
            ...(productState.data?.products || []).map((item) => ({
              value: item._id,
              label: `${item.name}${item.productCode ? ` (${item.productCode})` : ""}`,
            })),
          ]}
          required
          value={product}
        />

        <p className="text-xs font-semibold text-muted">
          Targeting below is optional and independent — leave all three blank to recommend to everyone.
        </p>

        <Select
          id="recommendation-target-role"
          label="Target Role (optional)"
          name="targetRole"
          onChange={(event) => setTargetRole(event.target.value)}
          options={[
            { value: "", label: roleState.isLoading ? "Loading roles..." : "Any role" },
            ...roleState.roles.map((role) => ({ value: role._id, label: role.name.toUpperCase() })),
          ]}
          value={targetRole}
        />

        <Select
          id="recommendation-target-team"
          label="Target Team (optional — a manager's downline)"
          name="targetTeam"
          onChange={(event) => setTargetTeam(event.target.value)}
          options={[
            { value: "", label: employeeState.isLoading ? "Loading managers..." : "Any team" },
            ...managerTierEmployees.map((employee) => ({ value: employee._id, label: employeeOptionLabel(employee) })),
          ]}
          value={targetTeam}
        />

        <Select
          id="recommendation-target-area"
          label="Target District (optional)"
          name="targetArea"
          onChange={(event) => setTargetArea(event.target.value)}
          options={[
            { value: "", label: districtState.isLoading ? "Loading districts..." : "Any district" },
            ...(districtState.data?.districts || []).map((district) => ({ value: district._id, label: district.name })),
          ]}
          value={targetArea}
        />

        <Textarea
          error={fieldErrors.reason}
          id="recommendation-reason"
          label="Reason"
          maxLength={1000}
          name="reason"
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
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
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
            disabled={actions.createRecommendation.isLoading}
            type="submit"
          >
            {actions.createRecommendation.isLoading ? "Submitting..." : "Create Draft"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
