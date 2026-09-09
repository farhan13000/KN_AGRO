import { MyAttendanceListView } from "../../../features/attendance";

export default function EmployeeMyAttendancePage({ showHeading = true }) {
  return <MyAttendanceListView description="Check in/out and view your own attendance history." portalLabel="Employee" showHeading={showHeading} />;
}
