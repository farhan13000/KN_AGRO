import { ROUTES } from "../../../shared/constants";
import { LeadFollowUpsView } from "../../../features/leads";

export default function EmployeeFollowUpsPage() {
  return (
    <LeadFollowUpsView
      detailPath={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      roleLabel="Employee CRM"
      showAssignments={false}
      showSource={false}
      title="My Follow-Ups"
    />
  );
}
