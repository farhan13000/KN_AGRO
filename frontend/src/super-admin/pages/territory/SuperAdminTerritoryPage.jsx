import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SuperAdminRegionListPage from "../regions/SuperAdminRegionListPage";
import SuperAdminDistrictListPage from "../districts/SuperAdminDistrictListPage";

/**
 * Regions and the districts inside them. A district only exists against a
 * region, so the two lists belong on one screen. Create and edit keep
 * their own routes; the buttons on each tab still lead there.
 */
const TABS = [
  {
    id: "regions",
    label: "Regions",
    permission: PERMISSIONS.REGION_READ,
    blurb: "Sales regions, their codes and the managers who own them.",
    render: () => <SuperAdminRegionListPage showHeading={false} />,
  },
  {
    id: "districts",
    label: "Districts",
    permission: PERMISSIONS.DISTRICT_READ,
    blurb: "Districts, each belonging to one region.",
    render: () => <SuperAdminDistrictListPage showHeading={false} />,
  },
];

export default function SuperAdminTerritoryPage() {
  return (
    <TabbedWorkspace
      description="Regions and the districts that sit inside them."
      emptyDescription="You do not have permission to view territory setup."
      emptyTitle="No territory access"
      eyebrow="Org Structure"
      tabs={TABS}
      title="Territory"
    />
  );
}
