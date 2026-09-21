import { useEffect, useState } from "react";
import { LogIn, LogOut, MessageCircle } from "lucide-react";
import Card from "../../../shared/components/Card";
import { useAttendanceActions, useMyAttendanceToday } from "../hooks";
import {
  DEFAULT_ATTENDANCE_POLICY,
  TONE_CLASSES,
  describeCheckIn,
  describeCheckOut,
  describePolicy,
} from "../utils/attendancePolicy";
import AttendanceDayDetails from "./AttendanceDayDetails";
import AttendanceMarkDialog from "./AttendanceMarkDialog";
import { useAuth } from "../../../core/auth";
import { requiresMeterReading } from "../utils/attendanceRoles";
import { AttendanceReviewRequestDialog } from "./AttendanceReviewDialogs";

/**
 * Today's attendance: the rule, a live warning for what pressing the
 * button now would mean, the buttons, and — once marked — the photos,
 * readings and distance. A half day offers "discuss with your manager".
 *
 * The policy comes from the backend with today's record, so the times
 * shown are the times enforced.
 */
export default function AttendanceTodayWidget() {
  const { role } = useAuth();
  const todayState = useMyAttendanceToday();
  // null when closed, "in" or "out" while the photos are being taken.
  const [marking, setMarking] = useState(null);
  const [requestingReview, setRequestingReview] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const actions = useAttendanceActions({ onSuccess: () => todayState.refetch() });

  // Keep the warning line honest if the card is left open across 9:30 or 6:00.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const today = todayState.data;
  const policy = today?.policy || DEFAULT_ATTENDANCE_POLICY;
  const hasCheckedIn = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);

  const liveHint = !hasCheckedIn
    ? describeCheckIn(now, policy)
    : !hasCheckedOut
      ? describeCheckOut(now, policy)
      : null;

  // The dialog owns the photos and surfaces its own errors, so a failure
  // here is rethrown for it rather than swallowed into this card.
  const confirmMark = async (payload) => {
    const mutate = marking === "out" ? actions.checkOut.mutate : actions.checkIn.mutate;
    await mutate(payload);
    setMarking(null);
  };

  const canAskForReview = today?.status === "HALF_DAY" && today?._id && today?.review?.status !== "PENDING";

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">Attendance Today</h2>
          <p className="mt-1 text-xs font-semibold text-muted">{describePolicy(policy)}</p>
        </div>
        <div className="flex gap-3">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-50"
            disabled={hasCheckedIn || actions.checkIn.isLoading}
            onClick={() => setMarking("in")}
            type="button"
          >
            <LogIn className="h-4 w-4" />
            Check In
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasCheckedIn || hasCheckedOut || actions.checkOut.isLoading}
            onClick={() => setMarking("out")}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
      </div>

      {liveHint && !todayState.isLoading ? (
        <p className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${TONE_CLASSES[liveHint.tone]}`}>
          {liveHint.message}
        </p>
      ) : null}

      {today?.marked ? (
        <div className="mt-4">
          <AttendanceDayDetails
            actions={
              canAskForReview ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                  onClick={() => setRequestingReview(true)}
                  type="button"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuss with manager
                </button>
              ) : null
            }
            record={today}
          />
        </div>
      ) : null}

      <AttendanceMarkDialog
        isOpen={Boolean(marking)}
        minMeterReading={marking === "out" ? today?.checkInMeterReading ?? null : null}
        requireMeter={requiresMeterReading(role)}
        mode={marking || "in"}
        onClose={() => setMarking(null)}
        onConfirm={confirmMark}
        policy={policy}
      />

      <AttendanceReviewRequestDialog
        isOpen={requestingReview}
        onClose={() => setRequestingReview(false)}
        onSuccess={async () => {
          setRequestingReview(false);
          await todayState.refetch();
        }}
        record={today}
      />
    </Card>
  );
}
