import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import EmployeeLeadListPage from "./EmployeeLeadListPage";
import EmployeeFollowUpsPage from "./EmployeeFollowUpsPage";

/**
 * A field employee's own leads, and which of them need a call today. No
 * pipeline board here: the board is a manager's view of a whole team.
 */
const TABS = [
  {
    id: "list",
    label: "My leads",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "Leads assigned to you.",
    render: () => <EmployeeLeadListPage showHeading={false} />,
  },
  {
    id: "follow-ups",
    label: "Follow-ups",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "Your leads with a follow-up due, overdue first.",
    render: () => <EmployeeFollowUpsPage showHeading={false} />,
  },
];

export default function EmployeeLeadsWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Your leads, and what needs a call next."
      emptyDescription="You do not have permission to view leads."
      emptyTitle="No lead access"
      eyebrow="Employee CRM"
      tabs={TABS}
      title="Leads"
    />
  );
}
