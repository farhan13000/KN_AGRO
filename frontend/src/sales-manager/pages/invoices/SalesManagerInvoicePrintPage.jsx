import { ROUTES } from "../../../shared/constants";
import { InvoicePrintRouteView } from "../../../features/invoices";

export default function SalesManagerInvoicePrintPage() {
  return <InvoicePrintRouteView backTo={ROUTES.SALES_MANAGER.INVOICES} />;
}
