import { ProductRecommendationListView } from "../../../features/productRecommendations";

export default function SalesManagerProductRecommendationsPage() {
  return (
    <ProductRecommendationListView
      description="Recommendations targeted at you or your team, plus any drafts you've created yourself."
      portalLabel="My Team"
    />
  );
}
