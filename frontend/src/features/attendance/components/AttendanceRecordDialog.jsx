import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { PERMISSIONS } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { formatBusinessDateTime } from "../../../shared/utils";
import AttendanceCorrectionDialog from "./AttendanceCorrectionDialog";
import AttendanceDayDetails from "./AttendanceDayDetails";
import { AttendanceReviewDecisionDialog } from "./AttendanceReviewDialogs";

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint";

/**
 * One attendance record opened from a list, for whoever is looking after
 * someone else's attendance (a manager, the OA, the Super Admin): the
 * photos, meter readings, locations and review, plus what they may do
 * about it. `attendance.correct` gates both actions; the backend still
 * decides scope (downline only, never your own record).
 *
 * `record` null = closed. `onChanged` runs after a correction or a review
 * decision so the list behind it can refresh.
 */
export default function AttendanceRecordDialog({ onChanged, onClose, record }) {
  const { hasPermission } = useAuth();
  const canCorrect = hasPermission(PERMISSIONS.ATTENDANCE_CORRECT);
  const [correcting, setCorrecting] = useState(null);
  const [deciding, setDeciding] = useState(null);

  const name = record?.employee?.user?.name || record?.employee?.employeeCode || "";
  const day = record?.date ? formatBusinessDateTime(record.date).split(",")[0] : "";
  const pending = record?.review?.status === "PENDING";

  return (
    <>
      <Modal isOpen={Boolean(record)} onClose={onClose} title={name ? `${name} · ${day}` : "Attendance"}>
        <AttendanceDayDetails
          actions={
            canCorrect && record ? (
              <>
                {pending ? (
                  <button
                    className={primaryButton}
                    onClick={() => {
                      setDeciding(record);
                      onClose();
                    }}
                    type="button"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Review request
                  </button>
                ) : null}
                <button
                  className={pending ? secondaryButton : primaryButton}
                  onClick={() => {
                    setCorrecting(record);
                    onClose();
                  }}
                  type="button"
                >
                  Edit / correct
                </button>
              </>
            ) : null
          }
          record={record}
        />
      </Modal>

      <AttendanceReviewDecisionDialog
        isOpen={Boolean(deciding)}
        onClose={() => setDeciding(null)}
        onSuccess={async () => {
          setDeciding(null);
          await onChanged?.();
        }}
        record={deciding}
      />

      <AttendanceCorrectionDialog
        isOpen={Boolean(correcting)}
        onClose={() => setCorrecting(null)}
        onSuccess={async () => {
          setCorrecting(null);
          await onChanged?.();
        }}
        record={correcting}
      />
    </>
  );
}
