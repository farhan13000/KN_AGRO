import { useParams } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import { TeamMemberWorkspace } from "../../../features/employees";

export default function SuperAdminTeamMemberPage() {
  const { employeeId } = useParams();
  return (
    <TeamMemberWorkspace
      backTo={ROUTES.SUPER_ADMIN.MY_TEAM}
      employeeId={employeeId}
      portalLabel="My Team"
    />
  );
}
