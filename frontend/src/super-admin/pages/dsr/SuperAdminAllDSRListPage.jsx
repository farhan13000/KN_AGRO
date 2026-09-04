import { AllDSRListView } from "../../../features/dsr";

export default function SuperAdminAllDSRListPage() {
  return (
    <AllDSRListView
      description="Every DSR submitted company-wide. DSR_READ_ALL is currently held only via the SA wildcard — no seeded role grants it directly."
      portalLabel="Org Structure"
    />
  );
}
