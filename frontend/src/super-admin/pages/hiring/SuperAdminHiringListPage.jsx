import { HiringPipelineView } from "../../../features/hiring";
import { ROUTES } from "../../../shared/constants";

export default function SuperAdminHiringListPage() {
  return (
    <HiringPipelineView
      createHref={ROUTES.SUPER_ADMIN.HIRING_CREATE}
      description="Every hiring request and where it stands. Anyone managing people can raise one; the Super Admin approves it, and that approval is what creates the account."
      portalLabel="Org Structure"
    />
  );
}
