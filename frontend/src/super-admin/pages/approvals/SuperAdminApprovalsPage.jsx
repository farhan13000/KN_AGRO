import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import { PendingApplicationsView } from "../../../features/employees";
import { HiringPipelineView } from "../../../features/hiring";
import { PendingApprovalsView } from "../../../features/promotions";
import { SalaryProposalPipelineView } from "../../../features/salaryProposals";

/**
 * Everything waiting on a decision, in one place.
 *
 * The four queues used to be four sidebar entries, which made "what needs
 * me today?" a question you answered by visiting four pages. They are the
 * same shape of work — read a request, approve or reject it — so they are
 * one screen with a selector. TabbedWorkspace carries the tab, permission
 * and URL behaviour; this file only says which queues exist.
 */
const TABS = [
  {
    id: "hiring",
    label: "Hiring",
    permission: PERMISSIONS.HIRING_READ,
    blurb:
      "Every hiring request and where it stands. Anyone managing people can raise one; approving it is what creates the account.",
    render: () => (
      <HiringPipelineView createHref={ROUTES.SUPER_ADMIN.HIRING_CREATE} showHeading={false} />
    ),
  },
  {
    id: "promotions",
    label: "Promotions",
    permission: PERMISSIONS.PROMOTION_READ,
    blurb:
      "Promotions awaiting a decision. Approving completes the role change immediately; the backend still enforces which tier may decide each one.",
    render: () => (
      <PendingApprovalsView showHeading={false} />
    ),
  },
  {
    id: "salary",
    label: "Salary proposals",
    permission: PERMISSIONS.SALARY_PROPOSAL_READ,
    blurb:
      "Salary change proposals across the org. Approve and finalize are Super Admin-only.",
    render: () => (
      <SalaryProposalPipelineView showHeading={false} />
    ),
  },
  {
    id: "employees",
    label: "Employee applications",
    permission: PERMISSIONS.EMPLOYEES_APPROVE,
    blurb: "Employee registrations waiting to be approved or rejected.",
    render: () => <PendingApplicationsView showHeading={false} />,
  },
];

export default function SuperAdminApprovalsPage() {
  return (
    <TabbedWorkspace
      description="Everything waiting on a decision. Pick a queue to review it."
      emptyDescription="You do not have permission to review any approval queue."
      emptyTitle="Nothing to approve"
      eyebrow="Org Structure"
      paramName="type"
      tabs={TABS}
      title="Approvals"
    />
  );
}
