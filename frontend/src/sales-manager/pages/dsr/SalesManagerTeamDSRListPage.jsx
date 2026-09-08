import { TeamDSRListView } from "../../../features/dsr";

export default function SalesManagerTeamDSRListPage({ showHeading = true }) {
  return (
    <TeamDSRListView
      description="DSRs from your downline. Review and Acknowledge are only available if the backend confirms you manage this employee."
      portalLabel="My Team"
      showHeading={showHeading}
    />
  );
}
