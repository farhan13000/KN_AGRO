import { HiringPipelineView } from "../../../features/hiring";
import { ROUTES } from "../../../shared/constants";

export default function SalesManagerHiringListPage() {
  return (
    <HiringPipelineView
      createHref={ROUTES.SALES_MANAGER.HIRING_CREATE}
      description="Hiring requests for your team. Raise a request here; the Super Admin approves it, and that approval is what creates the account."
      portalLabel="My Team"
    />
  );
}
