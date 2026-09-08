import { ROUTES } from "../../../shared/constants";
import { InvoiceListView } from "../../../features/invoices";

export default function SalesManagerInvoiceListPage({ showHeading = true }) {
  return (
    <InvoiceListView
      detailPath={(invoice) => `${ROUTES.SALES_MANAGER.INVOICES}/${invoice._id}`}
      roleLabel="Manager CRM"
      showHeading={showHeading}
      subtitle="Invoices generated from orders, with payment status and search."
      title="Invoices"
    />
  );
}
