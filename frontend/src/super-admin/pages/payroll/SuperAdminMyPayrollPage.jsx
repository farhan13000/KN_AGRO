import { MyPayrollView } from "../../../features/payroll";

export default function SuperAdminMyPayrollPage({ showHeading = true }) {
  return <MyPayrollView portalLabel="My Workspace" showHeading={showHeading} />;
}
