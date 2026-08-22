import InternalAppLayout from "../../shared/layouts/InternalAppLayout";
import { salesManagerNavigation } from "../navigation/salesManagerNavigation";

export default function SalesManagerLayout() {
  return <InternalAppLayout navigationItems={salesManagerNavigation} portalLabel="Sales Manager Portal" />;
}

