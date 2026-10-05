import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerMyDSRListPage from "./SalesManagerMyDSRListPage";
import SalesManagerTeamDSRListPage from "./SalesManagerTeamDSRListPage";
import { DSRDailyReportView } from "../../../features/dsr";

const TABS = [
  // First, because chasing the gap is the evening job. "Mine" is what a
  // manager opens once a day; this is what they open to find out who to
  // ring.
  {
    id: "daily",
    label: "Daily report",
    permission: PERMISSIONS.DSR_READ_TEAM,
    blurb:
      "Everyone in your team who owes a daily report, for one day — who has filed and who has not, with the day's check-in beside each name.",
    render: () => <DSRDailyReportView detailPath={(dsrId) => ROUTES.SALES_MANAGER.DSR_PRINT.replace(":dsrId", dsrId)} />,
  },
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
      "Daily reports from your team. Review and Acknowledge appear only for the people you manage.",
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
