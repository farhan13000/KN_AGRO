import { AllAttendanceListView, AttendanceDailyReportView } from "../../../features/attendance";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import { PERMISSIONS } from "../../../shared/constants";

/**
 * The daily report leads, because it is the question actually asked every
 * morning — "who is out there today?" The full record list is still one
 * tab away for anything historical.
 *
 * The daily report needs only attendance.read_team (the scope decides
 * whose names appear), so an Office Admin reaches it on the same terms as
 * the Super Admin.
 */
const TABS = [
  {
    id: "daily",
    label: "Daily report",
    permission: PERMISSIONS.ATTENDANCE_READ_TEAM,
    blurb: "Everyone on the roster for one day — who has checked in and who has not. Open anybody's month from their row.",
    render: () => <AttendanceDailyReportView />,
  },
  {
    id: "records",
    label: "All records",
    permission: PERMISSIONS.ATTENDANCE_READ_ALL,
    blurb: "Every attendance record company-wide, with correction.",
    render: () => <AllAttendanceListView description="Every attendance record company-wide, with correction." />,
  },
];

export default function SuperAdminAllAttendancePage() {
  return (
    <TabbedWorkspace
      description="Attendance across the company."
      emptyDescription="You do not have permission to view attendance."
      emptyTitle="No attendance access"
      eyebrow="Org Structure"
      tabs={TABS}
      title="Attendance"
    />
  );
}
