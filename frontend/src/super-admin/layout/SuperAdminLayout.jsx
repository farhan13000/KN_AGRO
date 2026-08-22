import InternalAppLayout from "../../shared/layouts/InternalAppLayout";
import { superAdminNavigation } from "../navigation/superAdminNavigation";

export default function SuperAdminLayout() {
  return <InternalAppLayout navigationItems={superAdminNavigation} portalLabel="Super Admin Portal" />;
}

