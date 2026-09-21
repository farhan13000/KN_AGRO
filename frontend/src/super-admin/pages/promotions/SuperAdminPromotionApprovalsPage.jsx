import { PendingApprovalsView } from "../../../features/promotions";

export default function SuperAdminPromotionApprovalsPage() {
  return (
    <PendingApprovalsView
      description="Promotions waiting for a decision. Approving also settles who the employee will report to — the role change takes effect once that manager is set. Each promotion can only be decided by the tier it belongs to."
      portalLabel="Org Structure"
    />
  );
}
