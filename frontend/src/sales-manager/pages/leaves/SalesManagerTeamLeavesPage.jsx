import { TeamLeavesListView } from "../../../features/leaves";

export default function SalesManagerTeamLeavesPage({ showHeading = true }) {
  return <TeamLeavesListView description="Your downline's leave requests — approve or reject." portalLabel="My Team" showHeading={showHeading} />;
}
