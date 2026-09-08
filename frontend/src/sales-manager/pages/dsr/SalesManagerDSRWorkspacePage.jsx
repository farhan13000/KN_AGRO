import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerMyDSRListPage from "./SalesManagerMyDSRListPage";
import SalesManagerTeamDSRListPage from "./SalesManagerTeamDSRListPage";

const TABS = [
  {
    id: "me",
    label: "Mine",
    permission: PERMISSIONS.DSR_READ_SELF,
    blurb: "Every DSR you have submitted, newest first.",
    render: () => <SalesManagerMyDSRListPage showHeading={false} />,
  },
  {
    id: "team",
    label: "My team",
    permission: PERMISSIONS.DSR_READ_TEAM,
    blurb:
      "DSRs from your downline. Review and Acknowledge appear only where the backend confirms you manage that employee.",
    render: () => <SalesManagerTeamDSRListPage showHeading={false} />,
  },
];

export default function SalesManagerDSRWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Daily sales reports, yours and your team's."
      emptyDescription="You do not have permission to view DSRs."
      emptyTitle="No DSR access"
      eyebrow="My Team"
      tabs={TABS}
      title="DSRs"
    />
  );
}
