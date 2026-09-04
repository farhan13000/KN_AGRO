import { getPortalLabelForRole, useAuth } from "../../core/auth";
import InternalAppLayout from "../../shared/layouts/InternalAppLayout";
import { salesManagerNavigation } from "../navigation/salesManagerNavigation";

export default function SalesManagerLayout() {
  const { role } = useAuth();
  return <InternalAppLayout navigationItems={salesManagerNavigation} portalLabel={getPortalLabelForRole(role)} />;
}

