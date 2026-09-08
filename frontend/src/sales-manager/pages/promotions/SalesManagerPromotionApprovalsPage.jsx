import { PendingApprovalsView } from "../../../features/promotions";

export default function SalesManagerPromotionApprovalsPage({ showHeading = true }) {
  return (
    <PendingApprovalsView
      description="Promotions awaiting a decision. You can only approve the tiers you are the configured approver for — the rest will explain why when you try."
      portalLabel="My Team"
      showHeading={showHeading}
    />
  );
}
