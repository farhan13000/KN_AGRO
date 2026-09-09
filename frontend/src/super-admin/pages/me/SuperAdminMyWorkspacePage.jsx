import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SuperAdminMyProfilePage from "../profile/SuperAdminMyProfilePage";
import SuperAdminMyPayrollPage from "../payroll/SuperAdminMyPayrollPage";

/**
 * Everything about you rather than about the company. The "My ..."
 * entries were scattered down the sidebar between company-wide screens;
 * they are one entry now, and each old path still resolves to its tab.
 */
const TABS = [
  {
    id: "profile",
    label: "Profile",
    permission: PERMISSIONS.EMPLOYEES_READ_SELF,
    blurb: "Your own employee record.",
    render: () => <SuperAdminMyProfilePage showHeading={false} />,
  },
  {
    id: "payroll",
    label: "Payslips",
    permission: PERMISSIONS.PAYROLL_READ_SELF,
    blurb: "Your own payslips, newest first.",
    render: () => <SuperAdminMyPayrollPage showHeading={false} />,
  },
];

export default function SuperAdminMyWorkspacePage() {
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
