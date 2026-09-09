import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import EmployeeProfilePage from "../profile/EmployeeProfilePage";
import EmployeeMyDSRListPage from "../dsr/EmployeeMyDSRListPage";
import EmployeeMyAttendancePage from "../attendance/EmployeeMyAttendancePage";
import EmployeeMyLeavesPage from "../leaves/EmployeeMyLeavesPage";
import EmployeeMyReportRequestsPage from "../reportRequests/EmployeeMyReportRequestsPage";
import EmployeeMyPayrollPage from "../payroll/EmployeeMyPayrollPage";

/**
 * Everything that was prefixed "My" in this sidebar: profile, DSRs,
 * attendance, leave, reports and payslips. Six entries for six views of
 * one person's own record is what a sidebar looks like when nobody has
 * grouped it; this is that grouping. Every old path still resolves, as a
 * tab on this page.
 */
const TABS = [
  {
    id: "profile",
    label: "Profile",
    permission: PERMISSIONS.EMPLOYEES_READ_SELF,
    blurb: "Your own employee record.",
    render: () => <EmployeeProfilePage showHeading={false} />,
  },
  {
    id: "attendance",
    label: "Attendance",
    permission: PERMISSIONS.ATTENDANCE_READ_SELF,
    blurb: "Check in and out, and see your month at a glance.",
    render: () => <EmployeeMyAttendancePage showHeading={false} />,
  },
  {
    id: "dsrs",
    label: "DSRs",
    permission: PERMISSIONS.DSR_READ_SELF,
    blurb: "Every daily sales report you have submitted.",
    render: () => <EmployeeMyDSRListPage showHeading={false} />,
  },
  {
    id: "leaves",
    label: "Leave",
    permission: PERMISSIONS.LEAVES_READ_SELF,
    blurb: "Request leave and track your own requests.",
    render: () => <EmployeeMyLeavesPage showHeading={false} />,
  },
  {
    id: "reports",
    label: "Reports",
    permission: PERMISSIONS.REPORTS_READ_SELF,
    blurb: "Reports your manager has asked you for.",
    render: () => <EmployeeMyReportRequestsPage showHeading={false} />,
  },
  {
    id: "payroll",
    label: "Payslips",
    permission: PERMISSIONS.PAYROLL_READ_SELF,
    blurb: "Your own payslips, newest first.",
    render: () => <EmployeeMyPayrollPage showHeading={false} />,
  },
];

export default function EmployeeMyWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Your profile, attendance, DSRs, leave, reports and payslips."
      emptyDescription="You do not have permission to view your own records."
      emptyTitle="Nothing here"
      eyebrow="My Workspace"
      tabs={TABS}
      title="My Workspace"
    />
  );
}
