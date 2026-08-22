import InternalAppLayout from "../../shared/layouts/InternalAppLayout";
import { employeeNavigation } from "../navigation/employeeNavigation";

export default function EmployeeLayout() {
  return <InternalAppLayout navigationItems={employeeNavigation} portalLabel="Employee Portal" />;
}

