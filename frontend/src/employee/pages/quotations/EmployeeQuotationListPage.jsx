import { ROUTES } from "../../../shared/constants";
import { QuotationListView } from "../../../features/quotations";

// No `createPath` — Employee holds only quotations.read in the seeded roles
// (see PHASE5_FRONTEND_API_CONTRACT.md), so the Create button never renders
// (QuotationListView derives that from the real permission), read-only.
export default function EmployeeQuotationListPage() {
  return (
    <QuotationListView
      detailPath={(quotation) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotation._id}`}
      roleLabel="Employee CRM"
      subtitle="View quotations for your own leads, backend-scoped, with status, date, and search filters."
      title="Quotations"
    />
  );
}
