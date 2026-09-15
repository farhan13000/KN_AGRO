import { env } from "../../../core/config/env.js";

/**
 * Client-side reading of the attendance time rules, for warnings only.
 *
 * The backend is the authority — it decides PRESENT vs HALF_DAY from its
 * own clock when the request arrives. This exists so the person sees the
 * consequence BEFORE they press the button, using the policy the backend
 * sends back from GET /attendance/me/today (the default below is only a
 * fallback for the moment before that loads).
 *
 * What is shown is deliberate: employees are told the last check-in time
 * is `checkInDisplayDeadline` (09:30). The real half-day cut-off
 * (`checkInHalfDayAfter`, 10:00) is never printed — past 09:30 the app
 * already warns that a late check-in counts as a half day.
 */
export const DEFAULT_ATTENDANCE_POLICY = Object.freeze({
  checkInDisplayDeadline: "09:30",
  checkInHalfDayAfter: "10:00",
  checkOutWindowStart: "18:00",
  checkOutWindowEnd: "18:30",
});

export const HALF_DAY_REASON_LABELS = Object.freeze({
  LATE_CHECK_IN: "Late check-in",
  EARLY_CHECK_OUT: "Checked out before the check-out time",
});

const clockToSeconds = (hhmm) => {
  const [hours, minutes] = String(hhmm || "0:0").split(":").map(Number);
  return hours * 3600 + minutes * 60;
};

/** Seconds since midnight of `date`, in the business timezone. */
const secondsOfDay = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: env.businessTimezone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: Number(part.value) }), {});
  return (parts.hour % 24) * 3600 + parts.minute * 60 + parts.second;
};

/** "18:00" -> "6:00 PM" */
export const formatClock = (hhmm) => {
  const [hours, minutes] = String(hhmm).split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

/**
 * { tone: "ok" | "warning" | "danger", message } for checking in at `now`.
 * Past the display deadline both the grace half-hour and after it read as
 * a half-day warning; only the colour differs.
 */
export const describeCheckIn = (now, policy = DEFAULT_ATTENDANCE_POLICY) => {
  const seconds = secondsOfDay(now);
  const deadline = formatClock(policy.checkInDisplayDeadline);

  if (seconds <= clockToSeconds(policy.checkInDisplayDeadline)) {
    return { tone: "ok", message: `Last check-in time is ${deadline}.` };
  }
  if (seconds <= clockToSeconds(policy.checkInHalfDayAfter)) {
    return {
      tone: "warning",
      message: `You are past the ${deadline} check-in time. A late check-in is counted as a half day.`,
    };
  }
  return {
    tone: "danger",
    message: `The check-in time (${deadline}) has passed. Today will be counted as a half day.`,
  };
};

/** { tone, message } for checking out at `now`. */
export const describeCheckOut = (now, policy = DEFAULT_ATTENDANCE_POLICY) => {
  const seconds = secondsOfDay(now);
  const start = formatClock(policy.checkOutWindowStart);
  const end = formatClock(policy.checkOutWindowEnd);

  if (seconds < clockToSeconds(policy.checkOutWindowStart)) {
    return {
      tone: "danger",
      message: `Checking out before ${start} counts today as a half day. You can ask your manager to review it afterwards.`,
    };
  }
  if (seconds <= clockToSeconds(policy.checkOutWindowEnd)) {
    return { tone: "ok", message: `Check-out time is ${start} – ${end}.` };
  }
  return {
    tone: "warning",
    message: `The check-out time closed at ${end}. This will be recorded as a late check-out.`,
  };
};

/** The one-line rule shown on the attendance card. */
export const describePolicy = (policy = DEFAULT_ATTENDANCE_POLICY) =>
  `Last check-in ${formatClock(policy.checkInDisplayDeadline)} · Check-out ${formatClock(
    policy.checkOutWindowStart,
  )} – ${formatClock(policy.checkOutWindowEnd)}`;

export const TONE_CLASSES = Object.freeze({
  ok: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
});
