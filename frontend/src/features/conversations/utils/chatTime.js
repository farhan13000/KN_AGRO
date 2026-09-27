import { env } from "../../../core/config/env.js";
import { getBusinessDateKey, parseDate } from "../../../shared/utils";

/** "4:05 pm" — the only thing a message bubble needs beside it. */
export const formatChatTime = (value) => {
  const parsed = parseDate(value);
  if (!parsed) return "";
  return parsed
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: env.businessTimezone })
    .toLowerCase();
};

/**
 * The heading on a day separator: "Today", "Yesterday", or a real date.
 * Days are compared in business time, not the browser's — a message sent
 * at 11pm in Lucknow must not read as tomorrow's to anyone.
 */
export const formatChatDay = (value, now = new Date()) => {
  const parsed = parseDate(value);
  if (!parsed) return "";

  const key = getBusinessDateKey(parsed);
  if (key === getBusinessDateKey(now)) return "Today";
  if (key === getBusinessDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))) return "Yesterday";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: env.businessTimezone,
    year: parsed.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
};

/** "2:15 pm" for something today, "12 Sep" for anything older — the inbox row's timestamp. */
export const formatInboxTime = (value, now = new Date()) => {
  const parsed = parseDate(value);
  if (!parsed) return "";
  if (getBusinessDateKey(parsed) === getBusinessDateKey(now)) return formatChatTime(value);
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: env.businessTimezone });
};

/** Groups an ascending list of messages into [{ day, messages }] for day separators. */
export const groupMessagesByDay = (messages) => {
  const groups = [];
  for (const message of messages) {
    const key = getBusinessDateKey(parseDate(message.createdAt) || new Date());
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.messages.push(message);
    else groups.push({ key, day: formatChatDay(message.createdAt), messages: [message] });
  }
  return groups;
};
