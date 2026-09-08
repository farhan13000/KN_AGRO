import { TeamReportRequestsListView } from "../../../features/reportRequests";

export default function SalesManagerReportRequestsPage({ showHeading = true }) {
  return (
    <TeamReportRequestsListView
      description="Ask your downline for a specific report, and review what comes back."
      portalLabel="My Team"
      showHeading={showHeading}
    />
  );
}
