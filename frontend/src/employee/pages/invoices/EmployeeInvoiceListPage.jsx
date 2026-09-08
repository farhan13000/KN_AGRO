import { ROUTES } from "../../../shared/constants";
import { InvoiceListView } from "../../../features/invoices";

export default function EmployeeInvoiceListPage({ showHeading = true }) {
  return (
    <InvoiceListView
      detailPath={(invoice) => `${ROUTES.EMPLOYEE.INVOICES}/${invoice._id}`}
      roleLabel="Employee CRM"
      showHeading={showHeading}
      subtitle="Invoices tied to your own assigned leads. Read-only."
      title="Invoices"
    />
  );
}
