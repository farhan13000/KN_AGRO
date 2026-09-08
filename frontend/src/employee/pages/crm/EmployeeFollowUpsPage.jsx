import { ROUTES } from "../../../shared/constants";
import { LeadFollowUpsView } from "../../../features/leads";

export default function EmployeeFollowUpsPage({ showHeading = true }) {
  return (
    <LeadFollowUpsView
      detailPath={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      roleLabel="Employee CRM"
      showAssignments={false}
      showHeading={showHeading}
      showSource={false}
      title="My Follow-Ups"
    />
  );
}
