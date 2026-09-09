import { MyPayrollView } from "../../../features/payroll";

export default function SalesManagerMyPayrollPage({ showHeading = true }) {
  return <MyPayrollView portalLabel="My Workspace" showHeading={showHeading} />;
}
