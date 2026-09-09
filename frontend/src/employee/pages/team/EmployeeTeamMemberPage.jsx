import { useParams } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { TeamMemberWorkspace } from "../../../features/employees";

export default function EmployeeTeamMemberPage() {
  const { employeeId } = useParams();
  return (
    <TeamMemberWorkspace
      backTo={ROUTES.EMPLOYEE.MY_TEAM}
      employeeId={employeeId}
      portalLabel="My Team"
    />
  );
}
