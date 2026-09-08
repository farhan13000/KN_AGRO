import { TeamAttendanceListView } from "../../../features/attendance";

export default function SalesManagerTeamAttendancePage({ showHeading = true }) {
  return <TeamAttendanceListView description="Your downline's attendance, full chain not just direct reports." portalLabel="My Team" showHeading={showHeading} />;
}
