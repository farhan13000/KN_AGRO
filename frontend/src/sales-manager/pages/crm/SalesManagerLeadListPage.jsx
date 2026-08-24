import { ROUTES } from "../../../shared/constants";
import { LeadListView } from "../../../features/leads";

export default function SalesManagerLeadListPage() {
  return (
    <LeadListView
      detailPath={(lead) => `${ROUTES.SALES_MANAGER.LEADS}/${lead._id}`}
      roleLabel="Manager CRM"
      showAssignments
      subtitle="Review leads returned by your backend manager scope. The browser does not filter global lead data."
      title="Assigned Leads"
    />
  );
}
