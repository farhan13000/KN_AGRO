import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerMyProfilePage from "../profile/SalesManagerMyProfilePage";
import SalesManagerMyPayrollPage from "../payroll/SalesManagerMyPayrollPage";

/** Your own record and your own payslips, in one entry. */
const TABS = [
  {
    id: "profile",
    label: "Profile",
    permission: PERMISSIONS.EMPLOYEES_READ_SELF,
    blurb: "Your own employee record.",
    render: () => <SalesManagerMyProfilePage showHeading={false} />,
  },
  {
    id: "payroll",
    label: "Payslips",
    permission: PERMISSIONS.PAYROLL_READ_SELF,
    blurb: "Your own payslips, newest first.",
    render: () => <SalesManagerMyPayrollPage showHeading={false} />,
  },
];

export default function SalesManagerMyWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Your profile and your payslips."
      emptyDescription="You do not have permission to view your own records."
      emptyTitle="Nothing here"
      eyebrow="My Workspace"
      tabs={TABS}
      title="My Workspace"
    />
  );
}
