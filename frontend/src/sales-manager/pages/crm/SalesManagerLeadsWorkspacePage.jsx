import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SalesManagerLeadListPage from "./SalesManagerLeadListPage";
import SalesManagerCrmPipelinePage from "./SalesManagerCrmPipelinePage";
import SalesManagerFollowUpsPage from "./SalesManagerFollowUpsPage";

/** The team's leads as a list, as a pipeline, and by what is due next. */
const TABS = [
  {
    id: "list",
    label: "All leads",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "Every lead in your scope, with filters, assignment and pipeline value.",
    render: () => <SalesManagerLeadListPage showHeading={false} />,
  },
  {
    id: "pipeline",
    label: "Pipeline",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "The same leads as a stage-by-stage board.",
    render: () => <SalesManagerCrmPipelinePage showHeading={false} />,
  },
  {
    id: "follow-ups",
    label: "Follow-ups",
    permission: PERMISSIONS.LEADS_READ,
    blurb: "Leads with a follow-up due, overdue first.",
    render: () => <SalesManagerFollowUpsPage showHeading={false} />,
  },
];

export default function SalesManagerLeadsWorkspacePage() {
  return (
    <TabbedWorkspace
      description="Leads as a list, as a pipeline, and by what is due next."
      emptyDescription="You do not have permission to view leads."
      emptyTitle="No lead access"
      eyebrow="Manager CRM"
      tabs={TABS}
      title="Leads"
    />
  );
}
