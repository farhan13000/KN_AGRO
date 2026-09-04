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

// region/district come back as {_id, name, code} or null (backend
// lead.serializer.js's toGeoSummary) — captured once at creation, never
// recomputed on a later employee transfer (see Phase F09's own note).
export const formatGeoSummary = (geo) => (geo?.name ? geo.name : "Not Set");
