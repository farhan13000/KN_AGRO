import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../constants/lead.constants.js";

const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

/** Keeps an emptied box as "" so the field can actually be cleared. */
const trimOrText = (value) => String(value ?? "").trim();

const isBlank = (value) => value === "" || value === null || value === undefined;

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

/**
 * An empty selection is a real answer — "this lead is interested in
 * nothing yet" — so it becomes `[]`, not `undefined`. Dropping it meant
 * the Products dialog sent an empty body and the backend answered "At
 * least one field must be provided", which is why clearing (or saving
 * an already-empty) product list always failed.
 */
const normalizeProductIds = (value) => {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => (typeof item === "string" ? item : item?._id || item?.id)).filter(Boolean);
};

const numberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
};

export const pickPublicEnquiryPayload = (values) =>
  cleanPayload({
    name: trimOrUndefined(values.name),
    companyName: trimOrUndefined(values.companyName || values.company),
    phone: trimOrUndefined(values.phone),
    email: trimOrUndefined(values.email),
    location: trimOrUndefined(values.location),
    interestedProducts: normalizeProductIds(values.interestedProducts),
    message: trimOrUndefined(values.message),
  });

export const pickCreateLeadPayload = (values) =>
  cleanPayload({
    name: trimOrUndefined(values.name),
    companyName: trimOrUndefined(values.companyName),
    phone: trimOrUndefined(values.phone),
    email: trimOrUndefined(values.email),
    location: trimOrUndefined(values.location),
    source: LEAD_SOURCES.includes(values.source) ? values.source : undefined,
    interestedProducts: normalizeProductIds(values.interestedProducts),
    message: trimOrUndefined(values.message),
    priority: LEAD_PRIORITIES.includes(values.priority) ? values.priority : undefined,
    expectedValue: numberOrUndefined(values.expectedValue),
    assignedManager: trimOrUndefined(values.assignedManager),
    assignedEmployee: trimOrUndefined(values.assignedEmployee),
  });

const wasProvided = (values, key) => Object.prototype.hasOwnProperty.call(values, key);

/**
 * An edit sends only the fields the caller actually touched — the same
 * object is used by the full Edit Details form and by the one-field
 * dialogs (expected value, product interest), so a field nobody passed
 * must stay out of the request rather than be sent back as blank.
 *
 * Within the fields that WERE passed, an emptied box is an instruction
 * ("remove the company name"), not a reason to drop the field: dropping
 * it meant clearing anything silently did nothing, and clearing the only
 * field in a one-field dialog sent an empty body that the backend
 * rightly refused with "At least one field must be provided".
 *
 * Name, phone and email are the exception — the backend requires a real
 * value for each, so a blank one is left out and the existing value
 * stands rather than producing an error the form cannot explain.
 */
export const pickUpdateLeadPayload = (values) => {
  const payload = {};
  const put = (key, value) => {
    if (wasProvided(values, key) && value !== undefined) payload[key] = value;
  };

  put("name", trimOrUndefined(values.name));
  put("phone", trimOrUndefined(values.phone));
  put("email", trimOrUndefined(values.email));
  put("companyName", trimOrText(values.companyName));
  put("location", trimOrText(values.location));
  put("message", trimOrText(values.message));
  put("source", LEAD_SOURCES.includes(values.source) ? values.source : undefined);
  put("interestedProducts", normalizeProductIds(values.interestedProducts));
  // Emptying the pipeline-value box means "no expected value yet", which
  // this field stores as zero — it has no separate "unset".
  put("expectedValue", isBlank(values.expectedValue) ? 0 : numberOrUndefined(values.expectedValue));

  return payload;
};

export const pickStatusPayload = (values) =>
  cleanPayload({
    status: LEAD_STATUSES.includes(values.status) ? values.status : undefined,
    reason: trimOrUndefined(values.reason),
  });

export const pickPriorityPayload = (values) =>
  cleanPayload({
    priority: LEAD_PRIORITIES.includes(values.priority) ? values.priority : undefined,
  });

export const pickScheduleFollowUpPayload = (values) =>
  cleanPayload({
    followUpAt: trimOrUndefined(values.followUpAt),
    note: trimOrUndefined(values.note),
  });

export const pickCompleteFollowUpPayload = (values) =>
  cleanPayload({
    outcome: trimOrUndefined(values.outcome),
    nextFollowUpAt: trimOrUndefined(values.nextFollowUpAt),
  });

export const pickReopenPayload = (values) =>
  cleanPayload({
    reason: trimOrUndefined(values.reason),
  });
