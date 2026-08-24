import { ROUTES } from "../../../shared/constants";
import { LeadListView } from "../../../features/leads";

export default function EmployeeLeadListPage() {
  return (
    <LeadListView
      detailPath={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      roleLabel="Employee CRM"
      showAssignments={false}
      showSource={false}
      subtitle="Review leads returned by your backend employee scope. Assignment controls are not shown here."
      title="My Leads"
    />
  );
}
