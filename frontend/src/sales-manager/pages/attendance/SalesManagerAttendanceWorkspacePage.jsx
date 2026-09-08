import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerMyAttendancePage from "./SalesManagerMyAttendancePage";
import SalesManagerTeamAttendancePage from "./SalesManagerTeamAttendancePage";

const TABS = [
  {
    id: "me",
    label: "Mine",
    permission: PERMISSIONS.ATTENDANCE_READ_SELF,
    blurb: "Check in/out and view your own attendance history.",
    render: () => <SalesManagerMyAttendancePage showHeading={false} />,
  },
  {
    id: "team",
    label: "My team",
    permission: PERMISSIONS.ATTENDANCE_READ_TEAM,
    blurb: "Your downline's attendance -- the full chain, not just direct reports.",
    render: () => <SalesManagerTeamAttendancePage showHeading={false} />,
  },
];

export default function SalesManagerAttendanceWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Attendance, yours and your team's."
      emptyDescription="You do not have permission to view attendance."
      emptyTitle="No attendance access"
      eyebrow="My Team"
      tabs={TABS}
      title="Attendance"
    />
  );
}
