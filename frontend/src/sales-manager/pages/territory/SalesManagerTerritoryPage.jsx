import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerRegionListPage from "../regions/SalesManagerRegionListPage";
import SalesManagerDistrictListPage from "../districts/SalesManagerDistrictListPage";

/** The regions this manager covers and the districts inside them. */
const TABS = [
  {
    id: "regions",
    label: "Regions",
    permission: PERMISSIONS.REGION_READ,
    blurb: "Regions you cover.",
    render: () => <SalesManagerRegionListPage showHeading={false} />,
  },
  {
    id: "districts",
    label: "Districts",
    permission: PERMISSIONS.DISTRICT_READ,
    blurb: "Districts inside those regions.",
    render: () => <SalesManagerDistrictListPage showHeading={false} />,
  },
];

export default function SalesManagerTerritoryPage() {
  return (
    <TabbedWorkspace
      description="The regions you cover and the districts inside them."
      emptyDescription="You do not have permission to view territory."
      emptyTitle="No territory access"
      eyebrow="Org Structure"
      tabs={TABS}
      title="Territory"
    />
  );
}
