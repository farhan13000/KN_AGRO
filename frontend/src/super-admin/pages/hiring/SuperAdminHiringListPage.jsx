import { HiringPipelineView } from "../../../features/hiring";
import { ROUTES } from "../../../shared/constants";

export default function SuperAdminHiringListPage() {
  return (
    <HiringPipelineView
      createHref={ROUTES.SUPER_ADMIN.HIRING_CREATE}
      description="Every hiring request and its current stage. Each step is restricted to the role that owns it — Process (OA), Review (GM), Approve (SA), Complete (SA/OA)."
      portalLabel="Org Structure"
    />
  );
}
