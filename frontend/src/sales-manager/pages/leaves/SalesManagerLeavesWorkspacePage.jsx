import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerMyLeavesPage from "./SalesManagerMyLeavesPage";
import SalesManagerTeamLeavesPage from "./SalesManagerTeamLeavesPage";

const TABS = [
  {
    id: "me",
    label: "Mine",
    permission: PERMISSIONS.LEAVES_READ_SELF,
    blurb: "Request leave and track your own requests.",
    render: () => <SalesManagerMyLeavesPage showHeading={false} />,
  },
  {
    id: "team",
    label: "My team",
    permission: PERMISSIONS.LEAVES_READ_TEAM,
    blurb: "Your downline's leave requests -- approve or reject.",
    render: () => <SalesManagerTeamLeavesPage showHeading={false} />,
  },
];

export default function SalesManagerLeavesWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Leave, yours and your team's."
      emptyDescription="You do not have permission to view leaves."
      emptyTitle="No leave access"
      eyebrow="My Team"
      tabs={TABS}
      title="Leaves"
    />
  );
}
