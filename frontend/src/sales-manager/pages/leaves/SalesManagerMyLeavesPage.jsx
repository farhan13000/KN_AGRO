import { MyLeavesListView } from "../../../features/leaves";

export default function SalesManagerMyLeavesPage({ showHeading = true }) {
  return <MyLeavesListView description="Request leave and track your own requests." portalLabel="My Team" showHeading={showHeading} />;
}
