import { ROUTES } from "../../../shared/constants";
import { QuotationDetailRouteView } from "../../../features/quotations";

export default function SalesManagerQuotationDetailPage() {
  return (
    <QuotationDetailRouteView
      backTo={ROUTES.SALES_MANAGER.QUOTATIONS}
      detailPathFor={(quotation) => `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotation._id}`}
      editPathFor={(quotation) => `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotation._id}/edit`}
      leadDetailPathFor={(lead) => `${ROUTES.SALES_MANAGER.LEADS}/${lead._id}`}
      printPathFor={(quotation) => `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotation._id}/print`}
      roleLabel="Manager CRM"
    />
  );
}
