import { ROUTES, PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import { AllDSRListView, DSRDailyReportView } from "../../../features/dsr";

/**
 * The daily report leads, for the same reason it does on the attendance
 * screen: "who still has not filed today?" is the question actually
 * asked every evening, and the full history is one tab away for
 * everything else.
 *
 * It needs only DSR_READ_TEAM — the scope decides whose names appear —
 * so an Office Admin reaches it on the same terms as the Super Admin,
 * while the company-wide record list stays behind DSR_READ_ALL.
 */
const TABS = [
  {
    id: "daily",
    label: "Daily report",
    permission: PERMISSIONS.DSR_READ_TEAM,
    blurb:
      "Everyone who owes a daily report, for one day — who has filed and who has not, with the day's check-in beside each name.",
    render: () => <DSRDailyReportView detailPath={(dsrId) => ROUTES.SUPER_ADMIN.DSR_PRINT.replace(":dsrId", dsrId)} />,
  },
  {
    id: "records",
    label: "All reports",
    permission: PERMISSIONS.DSR_READ_ALL,
    blurb: "Every DSR submitted company-wide.",
    render: () => (
      <AllDSRListView
        description="Every DSR submitted company-wide."
        portalLabel="Org Structure"
        printRoute={ROUTES.SUPER_ADMIN.DSR_PRINT}
        showHeading={false}
      />
    ),
  },
];

export default function SuperAdminAllDSRListPage() {
  return (
    <TabbedWorkspace
      description="Daily sales reports across the company."
      emptyDescription="You do not have permission to view DSRs."
      emptyTitle="No DSR access"
      eyebrow="Org Structure"
      tabs={TABS}
      title="DSRs"
    />
  );
}
