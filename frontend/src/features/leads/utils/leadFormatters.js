import { formatMoney } from "../../../shared/utils/money.js";
import { LEAD_PRIORITY_LABELS, LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "../constants/lead.constants.js";

export const formatLeadStatus = (status) => LEAD_STATUS_LABELS[status] || status || "Unknown";

export const formatLeadPriority = (priority) => LEAD_PRIORITY_LABELS[priority] || priority || "Unknown";

export const formatLeadSource = (source) => LEAD_SOURCE_LABELS[source] || source || "Unknown";

export const formatPipelineValue = (value) => formatMoney(value);

export const formatEmployeeSummary = (employee) => {
  if (!employee) return "Unassigned";
  const name = employee.user?.name || employee.name || "";
  const code = employee.employeeCode || "";
  return [name, code].filter(Boolean).join(" - ") || "Assigned";
};

// The buyer's own state/district come back as plain strings (or empty)
// on lead.address — this just falls back to "Not Set" for a blank one.
export const formatGeoSummary = (value) => (value ? value : "Not Set");
