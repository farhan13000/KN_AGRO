import { MyLeavesListView } from "../../../features/leaves";

export default function EmployeeMyLeavesPage({ showHeading = true }) {
  return <MyLeavesListView description="Request leave and track your own requests." portalLabel="Employee" showHeading={showHeading} />;
}
