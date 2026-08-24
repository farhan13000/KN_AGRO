import { useEffect, useMemo, useState } from "react";
import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import Select from "../../../shared/forms/Select";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { BACKEND_ROLES, normalizeRoleName } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { EMPLOYEE_STATUS, useEmployeeList, useMyTeam, employeeOptionLabel } from "../../employees";
import { useProductList } from "../../products";
import { LEAD_STATUS, LEAD_STATUSES, LEAD_STATUS_LABELS } from "../constants";
import { useLeadActions } from "../hooks";
import {
  formatEmployeeSummary,
  formatPipelineValue,
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

const getEmployeeRole = (employee) => normalizeRoleName(employee?.user?.role?.name);

const ignoreHandledError = () => {};

const CrmActionError = ({ error, fallback }) =>
  error ? (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
      {getCrmErrorMessage(error, fallback)}
    </p>
  ) : null;

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

export function ProductInterestDialog({ isOpen, lead, onClose, onSuccess }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const productsState = useProductList({ limit: 100, status: "ACTIVE", sortBy: "name", sortOrder: "asc" }, { enabled: isOpen });
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) {
      setSelectedProducts((lead?.interestedProducts || []).map((product) => product._id || product).filter(Boolean));
    }
  }, [isOpen, lead]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.updateInterestedProducts.mutate(lead._id, selectedProducts).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update interested products">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label>
          <span className="form-label">Products</span>
          <select
            className="form-field min-h-44"
            multiple
            onChange={(event) =>
              setSelectedProducts(Array.from(event.target.selectedOptions).map((option) => option.value))
            }
            value={selectedProducts}
          >
            {(productsState.data?.products || []).map((product) => (
              <option key={product._id} value={product._id}>
                {[product.productCode, product.name].filter(Boolean).join(" - ")}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-semibold text-muted">
            Use Ctrl or Shift to select multiple products.
          </span>
        </label>
        {productsState.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
            {productsState.errorMessage}
          </p>
        ) : null}
        <CrmActionError error={actions.updateInterestedProducts.error} fallback="Unable to update interested products." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.updateInterestedProducts.isLoading} type="submit">
            {actions.updateInterestedProducts.isLoading ? "Saving..." : "Update Products"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function LeadEditDialog({ isOpen, lead, onClose, onSuccess }) {
  const [values, setValues] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    location: "",
    message: "",
  });
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) {
      setValues({
        name: lead?.name || "",
        companyName: lead?.companyName || "",
        phone: lead?.phone || "",
        email: lead?.email || "",
        location: lead?.location || "",
        message: lead?.message || "",
      });
    }
  }, [isOpen, lead]);

  const updateField = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.updateLead.mutate(lead._id, values).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit lead details">
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <div className="sm:col-span-2">
            <Textarea
              id="lead-edit-message"
              label="Message"
              maxLength={2000}
              name="message"
              onChange={updateField}
              value={values.message}
            />
          </div>
        </div>
        <p className="rounded-lg border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-muted">
          This form sends only ordinary lead details. Status, priority, assignment, expected value, product interest,
          and system fields use dedicated backend actions.
        </p>
        <CrmActionError error={actions.updateLead.error} fallback="Unable to update lead details." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.updateLead.isLoading} type="submit">
            {actions.updateLead.isLoading ? "Saving..." : "Save Details"}
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
  const allEmployeesState = useEmployeeList(activeEmployeeQuery, {
    enabled: isOpen && (isManagerAssignment || normalizedRole === BACKEND_ROLES.SUPER_ADMIN),
  });
  const myTeamState = useMyTeam(activeEmployeeQuery, {
    enabled: isOpen && !isManagerAssignment && normalizedRole === BACKEND_ROLES.SALES_MANAGER,
  });
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) setSelectedEmployeeId(currentAssignment?._id || "");
  }, [currentAssignment, isOpen]);

  const candidates = useMemo(() => {
    const source =
      !isManagerAssignment && normalizedRole === BACKEND_ROLES.SALES_MANAGER
        ? myTeamState.data?.employees || []
        : allEmployeesState.data?.employees || [];
    if (isManagerAssignment) {
      return source.filter((employee) => getEmployeeRole(employee) === BACKEND_ROLES.SALES_MANAGER);
    }
    return source.filter((employee) => getEmployeeRole(employee) !== BACKEND_ROLES.SUPER_ADMIN);
  }, [allEmployeesState.data, isManagerAssignment, myTeamState.data, normalizedRole]);

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
        <Select
          id={`lead-${assignmentType}-assignment`}
          label={`New ${isManagerAssignment ? "Manager" : "Employee"}`}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
          options={[
            { label: `Clear ${isManagerAssignment ? "manager" : "employee"} assignment`, value: "" },
            ...candidates.map((employee) => ({
              label: employeeOptionLabel(employee),
              value: employee._id,
            })),
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
          The backend validates allowed transitions and creates status history.
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

export function ExpectedValueDialog({ isOpen, lead, onClose, onSuccess }) {
  const [expectedValue, setExpectedValue] = useState("");
  const actions = useLeadDialogActions({ onClose, onSuccess });

  useEffect(() => {
    if (isOpen) setExpectedValue(String(lead?.expectedValue ?? ""));
  }, [isOpen, lead]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await actions.updateExpectedValue.mutate(lead._id, expectedValue).catch(ignoreHandledError);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update expected value">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg bg-mint/60 p-4 text-sm font-semibold text-forest">
          Current expected value: {formatPipelineValue(lead?.expectedValue)}
        </div>
        <TextInput
          id="lead-expected-value-change"
          label="Expected / Pipeline Value"
          min="0"
          onChange={(event) => setExpectedValue(event.target.value)}
          step="0.01"
          type="number"
          value={expectedValue}
        />
        <p className="rounded-lg border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-muted">
          This is pipeline value, not revenue, cash collected, invoice value, or order value.
        </p>
        <CrmActionError error={actions.updateExpectedValue.error} fallback="Unable to update expected value." />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={actions.updateExpectedValue.isLoading} type="submit">
            {actions.updateExpectedValue.isLoading ? "Saving..." : "Update Value"}
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
          The backend updates next follow-up and creates follow-up history.
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
          Completion and optional rescheduling happen atomically in the backend.
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
          Qualified means ready for quotation. This action does not create a quotation or any Phase 5 record.
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
          Close this lead using the backend status endpoint. Closed is distinct from lost and the backend remains
          responsible for validating whether this transition is allowed.
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
