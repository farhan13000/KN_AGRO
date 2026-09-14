import { PendingApprovalsView } from "../../../features/promotions";

export default function SuperAdminPromotionApprovalsPage() {
  return (
    <PendingApprovalsView
      description="Promotions awaiting a decision. Approving also settles who the employee will report to — the role change lands once that manager is set. The backend still enforces which tier may decide each one."
      portalLabel="Org Structure"
    />
  );
}
