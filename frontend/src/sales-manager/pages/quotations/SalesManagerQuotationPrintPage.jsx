import { ROUTES } from "../../../shared/constants";
import { QuotationPrintRouteView } from "../../../features/quotations";

export default function SalesManagerQuotationPrintPage() {
  return <QuotationPrintRouteView backTo={ROUTES.SALES_MANAGER.QUOTATIONS} />;
}
