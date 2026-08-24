import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../constants/lead.constants.js";

const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

const normalizeProductIds = (value) => {
  if (!Array.isArray(value)) return undefined;
  const ids = value
    .map((item) => (typeof item === "string" ? item : item?._id || item?.id))
    .filter(Boolean);
  return ids.length ? ids : undefined;
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

export const pickUpdateLeadPayload = (values) =>
  cleanPayload({
    name: trimOrUndefined(values.name),
    companyName: trimOrUndefined(values.companyName),
    phone: trimOrUndefined(values.phone),
    email: trimOrUndefined(values.email),
    location: trimOrUndefined(values.location),
    source: LEAD_SOURCES.includes(values.source) ? values.source : undefined,
    interestedProducts: normalizeProductIds(values.interestedProducts),
    message: trimOrUndefined(values.message),
    expectedValue: numberOrUndefined(values.expectedValue),
  });

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
