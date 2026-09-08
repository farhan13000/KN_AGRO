import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SuperAdminProductListPage from "../products/SuperAdminProductListPage";
import SuperAdminCategoryListPage from "../categories/SuperAdminCategoryListPage";

/**
 * The catalogue: what is sold, and how it is grouped. A product cannot be
 * created without a category, so the two lists sit on one screen.
 */
const TABS = [
  {
    id: "products",
    label: "Products",
    permission: PERMISSIONS.PRODUCTS_READ,
    blurb: "Everything in the catalogue, with pricing and status.",
    render: () => <SuperAdminProductListPage showHeading={false} />,
  },
  {
    id: "categories",
    label: "Categories",
    permission: PERMISSIONS.CATEGORIES_READ,
    blurb: "How products are grouped on the public site and in filters.",
    render: () => <SuperAdminCategoryListPage showHeading={false} />,
  },
];

export default function SuperAdminCataloguePage() {
  return (
    <TabbedWorkspace
      description="Products and the categories they are grouped under."
      emptyDescription="You do not have permission to view the catalogue."
      emptyTitle="No catalogue access"
      eyebrow="Product Catalog"
      tabs={TABS}
      title="Catalogue"
    />
  );
}
