import { PendingApprovalsView } from "../../../features/promotions";

export default function SuperAdminPromotionApprovalsPage() {
  return (
    <PendingApprovalsView
      description="Promotions awaiting a decision. Approving completes the role change immediately; the backend still enforces which tier may decide each one."
      portalLabel="Org Structure"
    />
  );
}
