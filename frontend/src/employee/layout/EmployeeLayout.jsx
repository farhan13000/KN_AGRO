import { getPortalLabelForRole, useAuth } from "../../core/auth";
import InternalAppLayout from "../../shared/layouts/InternalAppLayout";
import { employeeNavigation } from "../navigation/employeeNavigation";

export default function EmployeeLayout() {
  const { role } = useAuth();
  return <InternalAppLayout navigationItems={employeeNavigation} portalLabel={getPortalLabelForRole(role)} />;
}

