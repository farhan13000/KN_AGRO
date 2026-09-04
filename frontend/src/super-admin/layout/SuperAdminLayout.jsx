import { getPortalLabelForRole, useAuth } from "../../core/auth";
import InternalAppLayout from "../../shared/layouts/InternalAppLayout";
import { superAdminNavigation } from "../navigation/superAdminNavigation";

export default function SuperAdminLayout() {
  const { role } = useAuth();
  return <InternalAppLayout navigationItems={superAdminNavigation} portalLabel={getPortalLabelForRole(role)} />;
}

