import { ROUTES } from "../../../shared/constants";
import { QuotationListView } from "../../../features/quotations";

export default function SalesManagerQuotationListPage() {
  return (
    <QuotationListView
      createPath={ROUTES.SALES_MANAGER.QUOTATION_CREATE}
      detailPath={(quotation) => `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotation._id}`}
      roleLabel="Manager CRM"
      subtitle="Your team's quotations, with status, date and search filters."
      title="Quotations"
    />
  );
}
