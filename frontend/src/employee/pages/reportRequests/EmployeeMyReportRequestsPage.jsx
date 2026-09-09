import { MyReportRequestsListView } from "../../../features/reportRequests";

export default function EmployeeMyReportRequestsPage({ showHeading = true }) {
  return (
    <MyReportRequestsListView
      description="Reports requested from you — start, submit, and resubmit."
      portalLabel="Employee"
      showHeading={showHeading}
    />
  );
}
