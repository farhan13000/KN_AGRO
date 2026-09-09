import { MyPayrollView } from "../../../features/payroll";

export default function EmployeeMyPayrollPage({ showHeading = true }) {
  return <MyPayrollView portalLabel="My Workspace" showHeading={showHeading} />;
}
