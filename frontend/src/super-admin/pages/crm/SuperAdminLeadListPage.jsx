import { ROUTES } from "../../../shared/constants";
import { LeadListView } from "../../../features/leads";

export default function SuperAdminLeadListPage() {
  return (
    <LeadListView
      createPath={ROUTES.SUPER_ADMIN.LEAD_CREATE}
      detailPath={(lead) => `${ROUTES.SUPER_ADMIN.LEADS}/${lead._id}`}
      roleLabel="CRM"
      showCreate
      subtitle="View all backend-scoped leads with CRM filters, assignments, and pipeline value."
      title="Leads"
    />
  );
}
