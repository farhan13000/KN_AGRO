import { useEffect, useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import SearchableSelect from "../../../shared/forms/SearchableSelect";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { BACKEND_ROLES, MANAGER_TIER_ROLES, normalizeRoleName } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { EMPLOYEE_STATUS, useEmployeeList, useMyTeam, employeeSelectOption } from "../../employees";
import { useProductList } from "../../products";
// Narrow subpath, not the products barrel - this needs one formatter.
import { getProductUnitLabel } from "../../products/utils";
import { LEAD_STATUS, LEAD_STATUSES, LEAD_STATUS_LABELS } from "../constants";
import { useLeadActions } from "../hooks";
import {
  formatEmployeeSummary,
  pipelineValueFromProducts,
  getCrmErrorDetails,
  getCrmErrorMessage,
  shouldRefetchAfterCrmError,
} from "../utils";

const toIsoDateTime = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const activeEmployeeQuery = Object.freeze({
  page: 1,
  limit: 100,
  employeeStatus: EMPLOYEE_STATUS.ACTIVE,
  sortBy: "employeeCode",
  sortOrder: "asc",
});

const directReportQuery = Object.freeze({ ...activeEmployeeQuery, directOnly: true });

const getEmployeeRole = (employee) => normalizeRoleName(employee?.user?.role?.name);

const ignoreHandledError = () => {};

const CrmActionError = ({ error, fallback }) => {
  if (!error) return null;
  const details = getCrmErrorDetails(error);
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
      <p>{getCrmErrorMessage(error, fallback)}</p>
      {details.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 font-medium">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const useLeadDialogActions = ({ onClose, onSuccess }) =>
  useLeadActions({
    onError: async (error) => {
      if (shouldRefetchAfterCrmError(error)) await onSuccess?.();
    },
    onSuccess: async () => {
      await onSuccess?.();
      onClose();
    },
  });

/**
 * Everything about a lead that is a plain edit, in ONE dialog.
 *
 * It used to be four: Edit Details, Products, Priority and Expected
 * Value, each its own button on the actions grid and each its own trip.
 * Three of them are the same act - correcting what was written down -
 * and splitting them meant a field officer who got the quantity and the
 * phone number wrong had to open two dialogs and save twice.
 *
 * Priority stays out, on purpose: the backend gives it its own endpoint
 * so that changing it writes its own PRIORITY_CHANGED activity, and
 * folding it in here would mean two requests behind one Save, where the
 * second can fail after the first has already gone through.
 *
 * The quantity rule is the same one the create form and the API enforce
 * - every product named needs a number against it, because the
 * manager's quotation is built from exactly this list and they cannot
 * add to it.
 */
export function LeadEditDialog({ isOpen, lead, onClose, onSuccess }) {
  const [values, setValues] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    location: "",
    message: "",
    expectedValue: "",
    interestedProducts: [],
    productQuantities: {},
  });
  const actions = useLeadDialogActions({ onClose, onSuccess });
  const productsState = useProductList(
    { limit: 100, status: "ACTIVE", sortBy: "name", sortOrder: "asc" },
    { enabled: isOpen }
  );

  const productOptions = useMemo(
    () =>
      (productsState.data?.products || []).map((product) => ({
        label: [product.productCode, product.name].filter(Boolean).join(" - "),
        value: product._id,
        price: product.sellingPrice,
        taxRate: product.taxRate,
        unit: product.unit,
      })),
    [productsState.data]
  );

  useEffect(() => {
    if (!isOpen) return;
    const existing = lead?.interestedProducts || [];
    setValues({
      name: lead?.name || "",
      companyName: lead?.companyName || "",
      phone: lead?.phone || "",
      email: lead?.email || "",
      location: lead?.location || "",
      message: lead?.message || "",
      expectedValue: lead?.expectedValue ? String(lead.expectedValue) : "",
      interestedProducts: existing.map((product) => product._id || product).filter(Boolean),
      productQuantities: Object.fromEntries(
        existing
          .filter((product) => product?._id && product.quantity)
          .map((product) => [String(product._id), String(product.quantity)])
      ),
    });
  }, [isOpen, lead]);

  const updateField = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  // Same behaviour as the create form: picking products or changing a
  // quantity re-states the pipeline value from the catalogue, and it
  // stays editable afterwards.
  const handleProductChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setValues((current) => {
      const quantities = Object.fromEntries(
        Object.entries(current.productQuantities || {}).filter(([id]) => selected.includes(id))
      );
      return {
        ...current,
        interestedProducts: selected,
        productQuantities: quantities,
        expectedValue: pipelineValueFromProducts(selected, productOptions, quantities),
      };
    });
  };

  const handleQuantityChange = (productId, quantity) => {
    setValues((current) => {
      const quantities = { ...(current.productQuantities || {}) };
      if (String(quantity).trim() === "") delete quantities[String(productId)];
      else quantities[String(productId)] = quantity;
      return {
        ...current,
        productQuantities: quantities,
        expectedValue: pipelineValueFromProducts(current.interestedProducts, productOptions, quantities),
      };
    });
  };

  const missingQuantity = (values.interestedProducts || []).filter((productId) => {
    const quantity = Number(values.productQuantities?.[String(productId)]);
    return !Number.isFinite(quantity) || quantity <= 0;
  }).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (missingQuantity) return;
    await actions.updateLead.mutate(lead._id, values).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit lead">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="lead-edit-name"
            label="Name"
            name="name"
            onChange={updateField}
            required
            value={values.name}
          />
          <TextInput
            id="lead-edit-company"
            label="Company / Business Name"
            name="companyName"
            onChange={updateField}
            value={values.companyName}
          />
          <TextInput id="lead-edit-phone" label="Phone" name="phone" onChange={updateField} value={values.phone} />
          <TextInput
            id="lead-edit-email"
            label="Email"
            name="email"
            onChange={updateField}
            type="email"
            value={values.email}
          />
          <TextInput
            id="lead-edit-location"
            label="Location"
            name="location"
            onChange={updateField}
            value={values.location}
          />
          <TextInput
            id="lead-edit-expected-value"
            label="Expected / Pipeline Value"
            min="0"
            name="expectedValue"
            onChange={updateField}
            step="0.01"
            type="number"
            value={values.expectedValue}
          />
        </div>

        <label>
          <span className="form-label">Interested Products</span>
          <select
            className="form-field min-h-32"
            id="lead-edit-products"
            multiple
            onChange={handleProductChange}
            value={values.interestedProducts}
          >
            {productOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-semibold text-muted">
            Use Ctrl or Shift to select multiple products.
          </span>
        </label>

        {values.interestedProducts?.length ? (
          <div>
            <span className="form-label">
              Quantity per product <span className="text-red-700">*</span>
            </span>
            <div className="mt-2 space-y-2 rounded-lg border border-forest/10 bg-white p-3">
              {values.interestedProducts.map((productId) => {
                const option = productOptions.find((item) => String(item.value) === String(productId));
                const label = option?.label || String(productId);
                return (
                  <div className="flex flex-wrap items-center gap-3" key={productId}>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{label}</span>
                    <input
                      aria-label={`Quantity for ${label}`}
                      className="form-field w-28"
                      min="0"
                      onChange={(event) => handleQuantityChange(productId, event.target.value)}
                      placeholder="Qty"
                      required
                      step="any"
                      type="number"
                      value={values.productQuantities?.[String(productId)] ?? ""}
                    />
                    <span className="w-16 shrink-0 text-sm font-bold text-muted">
                      {getProductUnitLabel(option?.unit)}
                    </span>
                  </div>
                );
              })}
            </div>
            {missingQuantity ? (
              <p className="form-error mt-2">
                {missingQuantity === values.interestedProducts.length
                  ? "Enter how much of each product they want."
                  : `${missingQuantity} of the ${values.interestedProducts.length} products still has no quantity.`}
              </p>
            ) : null}
            <span className="mt-1 block text-xs font-semibold text-muted">
              The quotation is built from this &mdash; whoever prices it later cannot add products you did not list.
            </span>
          </div>
        ) : null}

        <Textarea
          id="lead-edit-message"
          label="Message"
          maxLength={2000}
          name="message"
          onChange={updateField}
          value={values.message}
        />

        {productsState.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
            {productsState.errorMessage}
          </p>
        ) : null}
        <CrmActionError error={actions.updateLead.error} fallback="Unable to update this lead." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.updateLead.isLoading || Boolean(missingQuantity)} type="submit">
            {actions.updateLead.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AssignmentDialog({ assignmentType = "employee", isOpen, lead, onClose, onSuccess }) {
  const { role } = useAuth();
  const normalizedRole = normalizeRoleName(role);
  const isManagerAssignment = assignmentType === "manager";
  const currentAssignment = isManagerAssignment ? lead?.assignedManager : lead?.assignedEmployee;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  // ORG-HIERARCHY MIGRATION (Phase F09) — was gated to the legacy
  // SALES_MANAGER/SUPER_ADMIN role names only, meaning a GM/RM/ASM (or
  // the new SA) assigning an employee to a lead saw an empty candidate
  // list — neither query below was ever enabled for them. Widened to
  // MANAGER_TIER_ROLES (already defined in roles.constants.js
  // specifically for populating candidate-manager pickers like this one).
  const isManagerTierActor = MANAGER_TIER_ROLES.includes(normalizedRole);
  const allEmployeesState = useEmployeeList(activeEmployeeQuery, {
    enabled: isOpen && (isManagerAssignment || !isManagerTierActor),
  });
  // directOnly: true — the backend only ever accepts a DIRECT report as
  // the new employee (ensureEmployeeBelongsToManager checks
  // employee.manager === the acting manager's own id, never "anywhere in
  // my downline"). Without this, useMyTeam's default (the acting
  // manager's FULL multi-level downline) would list candidates several
  // tiers down that assignEmployee then rejects.
  const myTeamState = useMyTeam(directReportQuery, {
    enabled: isOpen && !isManagerAssignment && isManagerTierActor,
  });
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) setSelectedEmployeeId(currentAssignment?._id || "");
  }, [currentAssignment, isOpen]);

  const candidates = useMemo(() => {
    const source =
      !isManagerAssignment && isManagerTierActor
        ? myTeamState.data?.employees || []
        : allEmployeesState.data?.employees || [];
    // SO only, matching the backend's own LEAD_MANAGER_ASSIGNABLE_ROLES:
    // a lead's employee can only be an FO, and an FO's direct manager is
    // always an SO — so naming any other tier here would hand OA/SA a
    // lead nobody can ever be delegated to.
    if (isManagerAssignment) {
      return source.filter((employee) => getEmployeeRole(employee) === BACKEND_ROLES.SO);
    }
    // FO only, matching the backend's own EMPLOYEE_ASSIGNABLE_ROLES. An
    // SO's direct reports are already all FOs, so this changes nothing
    // for them — it matters for the OA/SA path, which reads the full
    // employee list and would otherwise offer tiers assignEmployee then
    // rejects outright.
    return source.filter((employee) => getEmployeeRole(employee) === BACKEND_ROLES.FO);
  }, [allEmployeesState.data, isManagerAssignment, isManagerTierActor, myTeamState.data]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isManagerAssignment) {
      await actions.assignManager.mutate(lead._id, selectedEmployeeId || null).catch(ignoreHandledError);
      return;
    }
    await actions.assignEmployee.mutate(lead._id, selectedEmployeeId || null).catch(ignoreHandledError);
  };

  const queryError = allEmployeesState.errorMessage || myTeamState.errorMessage;
  const isSaving = isManagerAssignment ? actions.assignManager.isLoading : actions.assignEmployee.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${currentAssignment ? "Reassign" : "Assign"} ${isManagerAssignment ? "manager" : "employee"}`}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Current assignment: {formatEmployeeSummary(currentAssignment)}
        </div>
        <SearchableSelect
          id={`lead-${assignmentType}-assignment`}
          label={`New ${isManagerAssignment ? "Manager" : "Employee"}`}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
          options={[
            { label: `Clear ${isManagerAssignment ? "manager" : "employee"} assignment`, value: "" },
            ...candidates.map(employeeSelectOption),
          ]}
          value={selectedEmployeeId}
        />
        {queryError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
            {queryError}
          </p>
        ) : null}
        <CrmActionError
          error={isManagerAssignment ? actions.assignManager.error : actions.assignEmployee.error}
          fallback={`Unable to ${currentAssignment ? "reassign" : "assign"} ${isManagerAssignment ? "manager" : "employee"}.`}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Confirm Assignment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function StatusChangeDialog({ isOpen, lead, onClose, onSuccess }) {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) {
      setStatus("");
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.changeStatus.mutate(lead._id, { status, reason }).catch(ignoreHandledError);
  };

  const statusOptions = LEAD_STATUSES.filter((item) => item !== lead?.status).map((item) => ({
    label: LEAD_STATUS_LABELS[item],
    value: item,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change lead status">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Current status: {LEAD_STATUS_LABELS[lead?.status] || lead?.status || "Unknown"}
        </div>
        <Select
          id="lead-next-status"
          label="Next Status"
          onChange={(event) => setStatus(event.target.value)}
          options={[{ label: "Select status", value: "" }, ...statusOptions]}
          required
          value={status}
        />
        {status === LEAD_STATUS.LOST ? (
          <Textarea
            id="lead-lost-reason"
            label="Reason"
            name="reason"
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
        ) : null}
        <p className="rounded-lg border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-muted">
          Only the next steps allowed from the current status are offered, and the change is added to the lead's history.
        </p>
        <CrmActionError error={actions.changeStatus.error} fallback="Unable to update lead status." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!status || actions.changeStatus.isLoading} type="submit">
            {actions.changeStatus.isLoading ? "Saving..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function PriorityChangeDialog({ isOpen, lead, onClose, onSuccess }) {
  const [priority, setPriority] = useState("");
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) setPriority(lead?.priority || "");
  }, [isOpen, lead]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.changePriority.mutate(lead._id, priority).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change lead priority">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          id="lead-priority-change"
          label="Priority"
          onChange={(event) => setPriority(event.target.value)}
          options={[
            { label: "Low", value: "LOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "High", value: "HIGH" },
            { label: "Urgent", value: "URGENT" },
          ]}
          value={priority}
        />
        <CrmActionError error={actions.changePriority.error} fallback="Unable to update priority." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!priority || actions.changePriority.isLoading} type="submit">
            {actions.changePriority.isLoading ? "Saving..." : "Update Priority"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function FollowUpScheduleDialog({ isOpen, lead, onClose, onSuccess }) {
  const [followUpAt, setFollowUpAt] = useState("");
  const [note, setNote] = useState("");
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) {
      setFollowUpAt("");
      setNote("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.scheduleFollowUp.mutate(lead._id, {
      followUpAt: toIsoDateTime(followUpAt),
      note,
    }).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule follow-up">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          id="lead-follow-up-at"
          label="Follow-Up Date And Time"
          min={new Date().toISOString().slice(0, 16)}
          onChange={(event) => setFollowUpAt(event.target.value)}
          required
          type="datetime-local"
          value={followUpAt}
        />
        <Textarea
          id="lead-follow-up-note"
          label="Note"
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
        <p className="rounded-lg border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-muted">
          This becomes the lead's next follow-up and is added to its history.
        </p>
        <CrmActionError error={actions.scheduleFollowUp.error} fallback="Unable to schedule follow-up." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!followUpAt || actions.scheduleFollowUp.isLoading} type="submit">
            {actions.scheduleFollowUp.isLoading ? "Saving..." : "Schedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function FollowUpCompleteDialog({ isOpen, lead, onClose, onSuccess }) {
  const [outcome, setOutcome] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) {
      setOutcome("");
      setNextFollowUpAt("");
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.completeFollowUp.mutate(lead._id, {
      outcome,
      nextFollowUpAt: toIsoDateTime(nextFollowUpAt),
    }).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete follow-up">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea
          id="lead-follow-up-outcome"
          label="Outcome"
          maxLength={1000}
          onChange={(event) => setOutcome(event.target.value)}
          required
          value={outcome}
        />
        <TextInput
          id="lead-next-follow-up-at"
          label="Next Follow-Up"
          min={new Date().toISOString().slice(0, 16)}
          onChange={(event) => setNextFollowUpAt(event.target.value)}
          type="datetime-local"
          value={nextFollowUpAt}
        />
        <p className="rounded-lg border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-muted">
          Completing this follow-up and scheduling the next one are saved together — either both happen or neither does.
        </p>
        <CrmActionError error={actions.completeFollowUp.error} fallback="Unable to complete follow-up." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!outcome.trim() || actions.completeFollowUp.isLoading} type="submit">
            {actions.completeFollowUp.isLoading ? "Saving..." : "Complete Follow-Up"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function MarkLostDialog({ isOpen, lead, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.markLost.mutate(lead._id, reason).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark lead lost">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea
          id="lead-mark-lost-reason"
          label="Lost Reason"
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
        />
        <CrmActionError error={actions.markLost.error} fallback="Unable to mark lead lost." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!reason.trim() || actions.markLost.isLoading} type="submit">
            {actions.markLost.isLoading ? "Saving..." : "Mark Lost"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function QualifyLeadDialog({ isOpen, lead, onClose, onSuccess }) {
  const actions = useLeadDialogActions({ onClose, onSuccess });

  const handleQualify = async () => {
    await actions.changeStatus.mutate(lead._id, { status: LEAD_STATUS.QUALIFIED }).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark lead qualified">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted">
          Qualified means this lead is ready for a quotation. This only changes the status — it does not create the quotation.
        </p>
        <CrmActionError error={actions.changeStatus.error} fallback="Unable to qualify this lead." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.changeStatus.isLoading} onClick={handleQualify}>
            {actions.changeStatus.isLoading ? "Saving..." : "Ready For Quotation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function CloseLeadDialog({ isOpen, lead, onClose, onSuccess }) {
  const actions = useLeadDialogActions({ onClose, onSuccess });

  const handleClose = async () => {
    await actions.closeLead.mutate(lead._id).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Close lead">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted">
          Closing is not the same as marking a lead lost — close it when the work on it is finished. If the lead's
          current status does not allow closing, you will be told.
        </p>
        <CrmActionError error={actions.closeLead.error} fallback="Unable to close this lead." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.closeLead.isLoading} onClick={handleClose}>
            {actions.closeLead.isLoading ? "Closing..." : "Close Lead"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
