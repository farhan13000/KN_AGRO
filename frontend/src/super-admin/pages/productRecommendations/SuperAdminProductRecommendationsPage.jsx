import { ProductRecommendationListView } from "../../../features/productRecommendations";

export default function SuperAdminProductRecommendationsPage() {
  return (
    <ProductRecommendationListView
      description="Every product recommendation you're allowed to see — as Super Admin, that's everything, including every DRAFT awaiting approval."
      portalLabel="Products"
    />
  );
}
