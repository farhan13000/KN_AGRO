import { env } from "../../core/config/env.js";

const dateFormatterOptions = Object.freeze({
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: env.businessTimezone,
});

export const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatBusinessDateTime = (value) => {
  const parsed = parseDate(value);
  if (!parsed) return "Not Set";
  return parsed.toLocaleString("en-IN", dateFormatterOptions);
};

export const getBusinessDateKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: env.businessTimezone,
    year: "numeric",
  }).format(date);

// Phase 6 Prompt 52: "use business timezone for any UX date hints" — this
// is purely a display computation off an already backend-confirmed
// OVERDUE status (callers must gate on that themselves; this never decides
// overdue-ness itself, only how many days). Both dates are first collapsed
// to their business-timezone calendar day (via getBusinessDateKey, the
// same mechanism getFollowUpPresentationState already uses for Leads),
// then re-parsed as UTC-midnight so the day math is a clean integer
// regardless of the viewer's own browser timezone or DST.
export const getBusinessDaysOverdue = (dueValue, now = new Date()) => {
  const due = parseDate(dueValue);
  if (!due) return null;

  const dueKey = getBusinessDateKey(due);
  const todayKey = getBusinessDateKey(now);
  const daysDiff = Math.round((new Date(`${todayKey}T00:00:00Z`) - new Date(`${dueKey}T00:00:00Z`)) / 86400000);

  return daysDiff > 0 ? daysDiff : 0;
};

export const getFollowUpPresentationState = (value, now = new Date()) => {
  const parsed = parseDate(value);
  if (!parsed) return { label: "No follow-up", tone: "muted" };

  const followUpKey = getBusinessDateKey(parsed);
  const todayKey = getBusinessDateKey(now);

  if (followUpKey < todayKey) return { label: "Overdue", tone: "danger" };
  if (followUpKey === todayKey) return { label: "Due today", tone: "warning" };
  return { label: "Upcoming", tone: "success" };
};
