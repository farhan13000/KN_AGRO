import { ProductRecommendationListView } from "../../../features/productRecommendations";

// No showCreateButton={false} here — FO/EMPLOYEE simply don't hold
// PRODUCTS_RECOMMEND in the seeded roles, so the create button already
// hides itself via the real permission check. Hardcoding a portal-based
// assumption here would duplicate a rule the backend (and this
// component's own hasPermission check) already enforces.
export default function EmployeeProductRecommendationsPage() {
  return (
    <ProductRecommendationListView
      description="Products recommended for your role, area, or team."
      portalLabel="Employee"
    />
  );
}
