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
 *
 * THERE IS NO CHECK-OUT *TIME*. The two window keys are gone from the
 * backend policy as well, so nothing here can quietly fall back to a
 * stale copy of a rule that no longer exists. What decides a full day now
 * is its LENGTH — `fullDayMinutes` — and what a check-out requires is
 * today's DSR. Both are facts about the work rather than about the clock.
 */
export const DEFAULT_ATTENDANCE_POLICY = Object.freeze({
  checkInDisplayDeadline: "09:30",
  checkInHalfDayAfter: "10:00",
  fullDayMinutes: 9 * 60,
});

/**
 * EARLY_CHECK_OUT is never produced any more, but days recorded under the
 * old rule still carry it and must still read as words rather than as an
 * enum name.
 */
export const HALF_DAY_REASON_LABELS = Object.freeze({
  LATE_CHECK_IN: "Late check-in",
  SHORT_DAY: "Worked less than a full day",
  EARLY_CHECK_OUT: "Checked out early (old rule, no longer applied)",
});

/** "8h 45m" / "9h" — the one place minutes become words in this feature. */
export const formatDuration = (minutes) => {
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

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

/**
 * { tone, message } for checking out at `now`.
 *
 * Two things can be said, in this order of importance: the DSR is the
 * only thing that can BLOCK a check-out, so it speaks first; after that,
 * how long the day has run so far, because that is what decides whether
 * it counts as a full day — and it is worth knowing BEFORE the button is
 * pressed, not after. The backend re-decides both from its own clock;
 * the arithmetic here only lets someone see it coming.
 */
export const describeCheckOut = (now, policy = DEFAULT_ATTENDANCE_POLICY, dsr = null, checkIn = null) => {
  if (dsr?.required && !dsr.submitted) {
    return {
      tone: "danger",
      message: "Submit today's DSR first. Your daily report is what closes the day.",
    };
  }

  const fullDay = policy.fullDayMinutes ?? DEFAULT_ATTENDANCE_POLICY.fullDayMinutes;
  const started = checkIn ? new Date(checkIn) : null;
  if (!started || Number.isNaN(started.getTime())) {
    return {
      tone: "ok",
      message: `Check out whenever your day is done — a day under ${formatDuration(fullDay)} counts as a half day.`,
    };
  }

  const worked = Math.max(0, Math.round((now.getTime() - started.getTime()) / 60000));
  if (worked < fullDay) {
    return {
      tone: "warning",
      message: `You have worked ${formatDuration(worked)} so far. Checking out now counts as a half day — a full day needs ${formatDuration(
        fullDay,
      )}, another ${formatDuration(fullDay - worked)}.`,
    };
  }
  return {
    tone: "ok",
    message: `You have worked ${formatDuration(worked)} today — a full day. Check out whenever you are done.`,
  };
};

/** The one-line rule shown on the attendance card. */
export const describePolicy = (policy = DEFAULT_ATTENDANCE_POLICY) =>
  `Last check-in ${formatClock(policy.checkInDisplayDeadline)} · Full day is ${formatDuration(
    policy.fullDayMinutes ?? DEFAULT_ATTENDANCE_POLICY.fullDayMinutes,
  )} · Check out any time, once today's DSR is in`;

export const TONE_CLASSES = Object.freeze({
  ok: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
});
