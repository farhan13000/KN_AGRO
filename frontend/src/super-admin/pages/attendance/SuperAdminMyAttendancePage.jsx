import { MyAttendanceListView } from "../../../features/attendance";

/**
 * The Office Admin's own attendance — check in, check out, and the
 * history of both. Separate from the company-wide attendance screen,
 * which shows everyone's and is where the Super Admin verifies this one.
 */
export default function SuperAdminMyAttendancePage({ showHeading = true }) {
  return (
    <MyAttendanceListView
      description="Check in and out, and see your own attendance history."
      portalLabel="My Work"
      showHeading={showHeading}
    />
  );
}
