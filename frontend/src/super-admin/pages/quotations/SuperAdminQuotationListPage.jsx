import { ROUTES } from "../../../shared/constants";
import { QuotationListView } from "../../../features/quotations";

export default function SuperAdminQuotationListPage() {
  return (
    <QuotationListView
      createPath={ROUTES.SUPER_ADMIN.QUOTATION_CREATE}
      detailPath={(quotation) => `${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotation._id}`}
      roleLabel="CRM"
      subtitle="View all backend-scoped quotations with status, date, and search filters."
      title="Quotations"
    />
  );
}
