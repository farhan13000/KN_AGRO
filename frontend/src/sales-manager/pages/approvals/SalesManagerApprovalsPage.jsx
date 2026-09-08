import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerHiringListPage from "../hiring/SalesManagerHiringListPage";
import SalesManagerPromotionApprovalsPage from "../promotions/SalesManagerPromotionApprovalsPage";
import SalesManagerSalaryProposalApprovalsPage from "../salaryProposals/SalesManagerSalaryProposalApprovalsPage";

/**
 * Everything a manager has raised or has to decide on, in one place --
 * the same grouping the Super Admin portal uses, so "what needs me today?"
 * is one screen in both.
 *
 * A manager mostly RAISES these rather than approving them; the backend
 * still decides who may approve what, and each view says so.
 */
const TABS = [
  {
    id: "hiring",
    label: "Hiring",
    permission: PERMISSIONS.HIRING_READ,
    blurb:
      "Hiring requests for your team. Raise one here; the Super Admin approves it, and that approval is what creates the account.",
    render: () => <SalesManagerHiringListPage showHeading={false} />,
  },
  {
    id: "promotions",
    label: "Promotions",
    permission: PERMISSIONS.PROMOTION_READ,
    blurb:
      "Promotions awaiting a decision. You can only approve the tiers you are the configured approver for.",
    render: () => <SalesManagerPromotionApprovalsPage showHeading={false} />,
  },
  {
    id: "salary",
    label: "Salary proposals",
    permission: PERMISSIONS.SALARY_PROPOSAL_READ,
    blurb:
      "Salary change proposals for your team. Approval and finalization need the Super Admin.",
    render: () => <SalesManagerSalaryProposalApprovalsPage showHeading={false} />,
  },
];

export default function SalesManagerApprovalsPage() {
  return (
    <TabbedWorkspace
      description="Hiring, promotions and salary proposals for your team."
      emptyDescription="You do not have permission to view any approval queue."
      emptyTitle="Nothing to approve"
      eyebrow="My Team"
      paramName="type"
      tabs={TABS}
      title="Approvals"
    />
  );
}
