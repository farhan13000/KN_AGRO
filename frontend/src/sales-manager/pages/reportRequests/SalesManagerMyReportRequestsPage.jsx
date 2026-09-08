import { MyReportRequestsListView } from "../../../features/reportRequests";

export default function SalesManagerMyReportRequestsPage({ showHeading = true }) {
  return (
    <MyReportRequestsListView
      description="Reports requested from you — start, submit, and resubmit."
      portalLabel="My Team"
      showHeading={showHeading}
    />
  );
}
