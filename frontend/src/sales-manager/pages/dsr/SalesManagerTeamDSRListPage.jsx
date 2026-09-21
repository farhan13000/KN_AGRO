import { ROUTES } from "../../../shared/constants";
import { TeamDSRListView } from "../../../features/dsr";

export default function SalesManagerTeamDSRListPage({ showHeading = true }) {
  return (
    <TeamDSRListView
      description="Daily reports from your team. Review and Acknowledge are available only for the people you manage."
      portalLabel="My Team"
      printRoute={ROUTES.SALES_MANAGER.DSR_PRINT}
      showHeading={showHeading}
    />
  );
}
