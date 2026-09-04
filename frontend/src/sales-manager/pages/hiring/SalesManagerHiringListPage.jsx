import { HiringPipelineView } from "../../../features/hiring";
import { ROUTES } from "../../../shared/constants";

export default function SalesManagerHiringListPage() {
  return (
    <HiringPipelineView
      createHref={ROUTES.SALES_MANAGER.HIRING_CREATE}
      description="Hiring requests for your team. Raise a request here; Office Admin processes it, a General Manager reviews it, and the Super Admin gives final approval."
      portalLabel="My Team"
    />
  );
}
