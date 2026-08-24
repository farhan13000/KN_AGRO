export const LEAD_STATUS = Object.freeze({
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  FOLLOW_UP: "FOLLOW_UP",
  QUALIFIED: "QUALIFIED",
  QUOTATION_SENT: "QUOTATION_SENT",
  NEGOTIATION: "NEGOTIATION",
  CONVERTED: "CONVERTED",
  LOST: "LOST",
  CLOSED: "CLOSED",
});

export const LEAD_STATUSES = Object.freeze(Object.values(LEAD_STATUS));

export const LEAD_STATUS_LABELS = Object.freeze({
  [LEAD_STATUS.NEW]: "New",
  [LEAD_STATUS.CONTACTED]: "Contacted",
  [LEAD_STATUS.FOLLOW_UP]: "Follow-Up",
  [LEAD_STATUS.QUALIFIED]: "Qualified",
  [LEAD_STATUS.QUOTATION_SENT]: "Quotation Sent",
  [LEAD_STATUS.NEGOTIATION]: "Negotiation",
  [LEAD_STATUS.CONVERTED]: "Converted",
  [LEAD_STATUS.LOST]: "Lost",
  [LEAD_STATUS.CLOSED]: "Closed",
});

export const LEAD_PRIORITY = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
});

export const LEAD_PRIORITIES = Object.freeze(Object.values(LEAD_PRIORITY));

export const LEAD_PRIORITY_LABELS = Object.freeze({
  [LEAD_PRIORITY.LOW]: "Low",
  [LEAD_PRIORITY.MEDIUM]: "Medium",
  [LEAD_PRIORITY.HIGH]: "High",
  [LEAD_PRIORITY.URGENT]: "Urgent",
});

export const LEAD_SOURCE = Object.freeze({
  WEBSITE: "WEBSITE",
  PHONE: "PHONE",
  WHATSAPP: "WHATSAPP",
  REFERRAL: "REFERRAL",
  WALK_IN: "WALK_IN",
  MANUAL: "MANUAL",
  OTHER: "OTHER",
});

export const LEAD_SOURCES = Object.freeze(Object.values(LEAD_SOURCE));

export const LEAD_SOURCE_LABELS = Object.freeze({
  [LEAD_SOURCE.WEBSITE]: "Website",
  [LEAD_SOURCE.PHONE]: "Phone",
  [LEAD_SOURCE.WHATSAPP]: "WhatsApp",
  [LEAD_SOURCE.REFERRAL]: "Referral",
  [LEAD_SOURCE.WALK_IN]: "Walk-In",
  [LEAD_SOURCE.MANUAL]: "Manual",
  [LEAD_SOURCE.OTHER]: "Other",
});

export const LEAD_SORT_FIELDS = Object.freeze([
  "createdAt",
  "nextFollowUpAt",
  "expectedValue",
  "priority",
  "name",
]);

export const DEFAULT_LEAD_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
  status: "",
  priority: "",
  source: "",
  assignedManager: "",
  assignedEmployee: "",
  product: "",
  location: "",
  from: "",
  to: "",
  followUpFrom: "",
  followUpTo: "",
  overdueFollowUp: "",
  sortBy: "createdAt",
  sortOrder: "desc",
});

export const DEFAULT_FOLLOW_UP_QUERY = Object.freeze({
  page: 1,
  limit: 10,
  search: "",
});
