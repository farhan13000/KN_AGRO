export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  LEAVE: "LEAVE",
  HOLIDAY: "HOLIDAY",
  WEEK_OFF: "WEEK_OFF",
});

export const ATTENDANCE_STATUS_LABELS = Object.freeze({
  [ATTENDANCE_STATUS.PRESENT]: "Present",
  [ATTENDANCE_STATUS.ABSENT]: "Absent",
  [ATTENDANCE_STATUS.HALF_DAY]: "Half Day",
  [ATTENDANCE_STATUS.LEAVE]: "Leave",
  [ATTENDANCE_STATUS.HOLIDAY]: "Holiday",
  [ATTENDANCE_STATUS.WEEK_OFF]: "Week Off",
});

/**
 * Why someone is not on the checked-in list — mirrors the backend's
 * DAILY_REPORT_REASON. Deliberately separate from ATTENDANCE_STATUS:
 * "not marked yet" is the absence of a record, which at 9am is most of
 * the company and is not the same claim as "absent".
 */
export const DAILY_REPORT_REASON = Object.freeze({
  NOT_MARKED: "NOT_MARKED",
  ABSENT: "ABSENT",
  LEAVE: "LEAVE",
  HOLIDAY: "HOLIDAY",
  WEEK_OFF: "WEEK_OFF",
});

export const DAILY_REPORT_REASON_LABELS = Object.freeze({
  [DAILY_REPORT_REASON.NOT_MARKED]: "Not marked yet",
  [DAILY_REPORT_REASON.ABSENT]: "Marked absent",
  [DAILY_REPORT_REASON.LEAVE]: "On leave",
  [DAILY_REPORT_REASON.HOLIDAY]: "Holiday",
  [DAILY_REPORT_REASON.WEEK_OFF]: "Week off",
});

/** Amber for "nothing yet" — a gap to chase, not a verdict. Red is only for a recorded absence. */
export const DAILY_REPORT_REASON_STYLE = Object.freeze({
  [DAILY_REPORT_REASON.NOT_MARKED]: "bg-amber-100 text-amber-800 ring-amber-200",
  [DAILY_REPORT_REASON.ABSENT]: "bg-red-100 text-red-800 ring-red-200",
  [DAILY_REPORT_REASON.LEAVE]: "bg-sky-100 text-sky-800 ring-sky-200",
  [DAILY_REPORT_REASON.HOLIDAY]: "bg-violet-100 text-violet-800 ring-violet-200",
  [DAILY_REPORT_REASON.WEEK_OFF]: "bg-forest/10 text-forest ring-forest/20",
});

export const ATTENDANCE_SOURCE = Object.freeze({
  SELF: "SELF",
  ADMIN_CORRECTION: "ADMIN_CORRECTION",
  SYSTEM: "SYSTEM",
});
