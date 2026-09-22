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

/**
 * Where the buyer is, in one line, from whichever field actually holds it.
 *
 * Two fields carry this and which one is filled depends on where the lead
 * came from: staff typing a lead in write a free-text `location` ("behind
 * the mandi, Barabanki"), while a website enquiry fills the structured
 * `address`. Showing only the structured half meant every lead an officer
 * had ever entered read "Not Set" — the address block is empty by design
 * for those, not missing.
 *
 * The typed line wins when there is one: it is what the person who met
 * the customer chose to write, and no assembled version of it is closer
 * to the truth.
 */
export const formatLeadLocation = (lead) => {
  const typed = String(lead?.location || "").trim();
  if (typed) return typed;

  const address = lead?.address || {};
  const parts = [address.village, address.postOffice, address.district, address.state, address.pincode]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : "Not Set";
};
