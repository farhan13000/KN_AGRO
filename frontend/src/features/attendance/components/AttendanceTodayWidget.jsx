import { useEffect, useState } from "react";
import { ClipboardList, LogIn, LogOut, MessageCircle, Palmtree } from "lucide-react";
import { Link } from "react-router-dom";
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
import { getPortalRoutesForRole, useAuth } from "../../../core/auth";
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

  // Keep the line honest if the card is left open — across 9:30 in the
  // morning, and across the moment the day reaches nine hours.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const today = todayState.data;
  const policy = today?.policy || DEFAULT_ATTENDANCE_POLICY;
  const hasCheckedIn = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);

  // The one thing that can now block a check-out. The server refuses it
  // either way; knowing here means the button can say so, instead of
  // sending someone off to take two photos for a request that was always
  // going to be turned down.
  const dsr = today?.dsr || null;
  const dsrBlocking = Boolean(hasCheckedIn && !hasCheckedOut && dsr?.required && !dsr.submitted);
  const dsrSubmitPath = getPortalRoutesForRole(role)?.DSR_SUBMIT || null;

  // AN APPROVED LEAVE DAY HAS NOTHING TO MARK. The server refuses a
  // check-in on one (AttendanceService._assertNotOnApprovedLeave), so
  // the buttons are not merely disabled here — the whole marking half of
  // the card is replaced by the reason. A greyed-out button with no
  // explanation is how someone ends up pressing it five times.
  //
  // The backend only reports this while the day is unmarked, so somebody
  // who checked in before the leave was approved still gets their normal
  // card and can close their day.
  const onLeave = Boolean(today?.leave?.onLeave) && !hasCheckedIn;

  const liveHint = onLeave
    ? null
    : !hasCheckedIn
      ? describeCheckIn(now, policy)
      : !hasCheckedOut
        ? describeCheckOut(now, policy, dsr, today?.checkIn)
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
          {onLeave ? null : (
            <p className="mt-1 text-xs font-semibold text-muted">{describePolicy(policy)}</p>
          )}
        </div>
        {onLeave ? null : (
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
            data-check-out
            disabled={!hasCheckedIn || hasCheckedOut || dsrBlocking || actions.checkOut.isLoading}
            onClick={() => setMarking("out")}
            title={dsrBlocking ? "Submit today's DSR first" : undefined}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
        )}
      </div>

      {onLeave ? (
        <div
          className="mt-4 flex gap-3 rounded-lg border border-forest/15 bg-mint/40 px-4 py-3"
          data-attendance-on-leave
        >
          <Palmtree aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
          <div>
            <p className="text-sm font-black text-ink">You are on leave today</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {today.leave.description}. There is nothing to mark on a leave day. If you are working after all, ask
              your manager to cancel the leave first.
            </p>
          </div>
        </div>
      ) : null}

      {liveHint && !todayState.isLoading ? (
        <p className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${TONE_CLASSES[liveHint.tone]}`}>
          {liveHint.message}
        </p>
      ) : null}

      {/* A disabled button with no way forward is a dead end, so the way
          forward sits right beside it. */}
      {dsrBlocking && dsrSubmitPath ? (
        <Link
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mustard px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-[#f1b842]"
          data-submit-dsr
          to={dsrSubmitPath}
        >
          <ClipboardList className="h-4 w-4" />
          Submit today&apos;s DSR
        </Link>
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
        checkIn={today?.checkIn || null}
        dsr={dsr}
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
