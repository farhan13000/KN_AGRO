import { MyAttendanceListView } from "../../../features/attendance";

export default function SalesManagerMyAttendancePage({ showHeading = true }) {
  return <MyAttendanceListView description="Check in/out and view your own attendance history." portalLabel="My Team" showHeading={showHeading} />;
}
