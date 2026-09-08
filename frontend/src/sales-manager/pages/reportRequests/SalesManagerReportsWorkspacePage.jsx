import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerMyReportRequestsPage from "./SalesManagerMyReportRequestsPage";
import SalesManagerReportRequestsPage from "./SalesManagerReportRequestsPage";

const TABS = [
  {
    id: "me",
    label: "Asked of me",
    permission: PERMISSIONS.REPORTS_READ_SELF,
    blurb: "Reports requested from you -- start, submit and resubmit.",
    render: () => <SalesManagerMyReportRequestsPage showHeading={false} />,
  },
  {
    id: "team",
    label: "Asked of my team",
    permission: PERMISSIONS.REPORTS_READ_TEAM,
    blurb: "Ask your downline for a specific report, and review what comes back.",
    render: () => <SalesManagerReportRequestsPage showHeading={false} />,
  },
];

export default function SalesManagerReportsWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Report requests, the ones asked of you and the ones you asked for."
      emptyDescription="You do not have permission to view report requests."
      emptyTitle="No report access"
      eyebrow="My Team"
      tabs={TABS}
      title="Reports"
    />
  );
}
