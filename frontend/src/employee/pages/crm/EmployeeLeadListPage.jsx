import { ROUTES } from "../../../shared/constants";
import { LeadListView } from "../../../features/leads";

export default function EmployeeLeadListPage({ showHeading = true }) {
  return (
    <LeadListView
      createPath={ROUTES.EMPLOYEE.LEAD_CREATE}
      detailPath={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      roleLabel="Employee CRM"
      showAssignments={false}
      showHeading={showHeading}
      showSource={false}
      subtitle="The leads assigned to you. Reassigning a lead is done by your manager."
      title="My Leads"
    />
  );
}
