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

const getBusinessDateKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: env.businessTimezone,
    year: "numeric",
  }).format(date);

export const getFollowUpPresentationState = (value, now = new Date()) => {
  const parsed = parseDate(value);
  if (!parsed) return { label: "No follow-up", tone: "muted" };

  const followUpKey = getBusinessDateKey(parsed);
  const todayKey = getBusinessDateKey(now);

  if (followUpKey < todayKey) return { label: "Overdue", tone: "danger" };
  if (followUpKey === todayKey) return { label: "Due today", tone: "warning" };
  return { label: "Upcoming", tone: "success" };
};
